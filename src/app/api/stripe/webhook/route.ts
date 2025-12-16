import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

type WebhookHandler = (
  event: Stripe.Event,
  userId: string
) => Promise<void>;

const webhookHandlers: Record<string, WebhookHandler> = {
  'checkout.session.completed': handleCheckoutCompleted,
  'invoice.paid': handleInvoicePaid,
  'invoice.payment_failed': handlePaymentFailed,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Webhook error: Missing stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`Received webhook event: ${event.type}`);

  const customerId = getCustomerId(event);

  if (!customerId) {
    console.log('No customer ID found in webhook event');
    return NextResponse.json({ received: true });
  }

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.warn(`User not found for Stripe customer: ${customerId}`);
    return NextResponse.json({ received: true });
  }

  const handler = webhookHandlers[event.type];
  if (handler) {
    try {
      await handler(event, user.id);
      console.log(`Successfully processed ${event.type} for user ${user.id}`);
    } catch (error) {
      console.error(`Error handling ${event.type}:`, error);
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      );
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  event: Stripe.Event,
  userId: string
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'ACTIVE',
      stripeSubscriptionId: session.subscription as string,
    },
  });
}

async function handleInvoicePaid(
  event: Stripe.Event,
  userId: string
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const periodEnd = invoice.lines.data[0]?.period?.end;
  if (periodEnd) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'ACTIVE',
        stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
      },
    });
  }
}

async function handlePaymentFailed(
  event: Stripe.Event,
  userId: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: 'PAST_DUE' },
  });
}

async function handleSubscriptionUpdated(
  event: Stripe.Event,
  userId: string
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  let status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' = 'ACTIVE';

  if (subscription.cancel_at_period_end) {
    status = 'CANCELED';
  } else if (subscription.status === 'past_due') {
    status = 'PAST_DUE';
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: status,
      stripePriceId: subscription.items.data[0]?.price.id,
    },
  });
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  userId: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: 'EXPIRED' },
  });
}

function getCustomerId(event: Stripe.Event): string | null {
  const obj = event.data.object;
  if ('customer' in obj && typeof obj.customer === 'string') {
    return obj.customer;
  }
  return null;
}
