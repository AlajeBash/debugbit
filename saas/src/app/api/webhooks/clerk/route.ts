import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '../../../../lib/db';

interface ClerkWebhookEvent {
  data: any;
  object: 'event';
  type: string; // 'user.created' | 'user.updated' | 'user.deleted' | 'organization.created' | 'organizationMembership.created'
}

export async function POST(req: NextRequest) {
  try {
    const payload: ClerkWebhookEvent = await req.json();
    const { type, data } = payload;

    if (!type || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload structure' }, { status: 400 });
    }

    console.log(`[Clerk Webhook] Received webhook event: ${type}`);

    switch (type) {
      // 1. Sync User profiles
      case 'user.created': {
        const primaryEmail = data.email_addresses?.find(
          (email: any) => email.id === data.primary_email_address_id
        )?.email_address || '';

        const { error } = await dbAdmin
          .from('users')
          .insert({
            id: data.id,
            email: primaryEmail,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            image_url: data.image_url || '',
            created_at: new Date(data.created_at).toISOString()
          });

        if (error) {
          console.error('[Clerk Webhook] Error writing user record:', error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case 'user.updated': {
        const primaryEmail = data.email_addresses?.find(
          (email: any) => email.id === data.primary_email_address_id
        )?.email_address || '';

        const { error } = await dbAdmin
          .from('users')
          .update({
            email: primaryEmail,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            image_url: data.image_url || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);

        if (error) {
          console.error('[Clerk Webhook] Error updating user record:', error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      case 'user.deleted': {
        const { error } = await dbAdmin
          .from('users')
          .delete()
          .eq('id', data.id);

        if (error) {
          console.error('[Clerk Webhook] Error purging user record:', error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      // 2. Sync Teams / Organizations
      case 'organization.created': {
        const { error } = await dbAdmin
          .from('teams')
          .insert({
            id: data.id,
            name: data.name,
            slug: data.slug || '',
            created_at: new Date(data.created_at).toISOString()
          });

        if (error) {
          console.error('[Clerk Webhook] Error creating organization:', error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      // 3. Sync Team Memberships
      case 'organizationMembership.created': {
        const { error } = await dbAdmin
          .from('team_members')
          .insert({
            team_id: data.organization.id,
            user_id: data.public_user_data.user_id,
            role: data.role === 'org:admin' ? 'admin' : 'member',
            created_at: new Date(data.created_at).toISOString()
          });

        if (error) {
          console.error('[Clerk Webhook] Error syncing organization membership:', error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        break;
      }

      default:
        console.log(`[Clerk Webhook] Unhandled webhook event type: ${type}`);
    }

    return NextResponse.json({ status: 'success', synced: type });

  } catch (err: any) {
    console.error('[Clerk Webhook Webhook API Handshake Failed]:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
