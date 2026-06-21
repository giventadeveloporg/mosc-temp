#!/usr/bin/env node
/**
 * Cleans stale MOSC user_profile rows from corrected_event_media_inserts.ordered.sql
 * and inserts six canonical profiles with +600000 IDs and tenant mosc_malankara_orthodox_2.
 * Keeps event_site_manager_admin_1 and tenant_demo_002 profiles unchanged.
 */
const fs = require('fs');
const path = require('path');

const TARGET = path.join(__dirname, 'corrected_event_media_inserts.ordered.sql');
const TENANT = 'mosc_malankara_orthodox_2';
const TENANT_TYPO = 'mosc_malankara_orthodox_02';

const CANONICAL_PROFILES = [
  `INSERT INTO public.user_profile (id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, clerk_user_id, clerk_session_id, clerk_org_id, clerk_org_role, auth_provider, auth_provider_user_id, email_verified, profile_image_url_clerk, last_sign_in_at, clerk_metadata, created_at, updated_at, request_id, request_reason, status, admin_comments, submitted_at, reviewed_at, approved_at, rejected_at) VALUES (604123, '${TENANT}', 'user_37x6Sw8TD5dVtvvdZmLaoIgDDNE', '', '', NULL, '', '', '', '', '', '', '', '', '', '', '', '', '', true, 'eyJhbGciOiJIUzI1NiJ9.e30.kflEYQGrBTeT3B6Q7z1nvfUNYT31lJioXH7bYbfzQrk', false, 'ACTIVE', 'ADMIN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-12 14:45:30.578', '2026-01-12 14:45:30.594214', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);`,
  `INSERT INTO public.user_profile (id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, clerk_user_id, clerk_session_id, clerk_org_id, clerk_org_role, auth_provider, auth_provider_user_id, email_verified, profile_image_url_clerk, last_sign_in_at, clerk_metadata, created_at, updated_at, request_id, request_reason, status, admin_comments, submitted_at, reviewed_at, approved_at, rejected_at) VALUES (604109, '${TENANT}', 'user_38DjmE80cjcjFhaVkW8hQkeuya2', 'RegularUpdated', 'Regular User', 'mosc.regular.user@keleno.com', '', '', '', '', '', '', '', '', '', '', '', '', 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18ydlFXRk5DSWkxaDQwbWZkTFk5T2t0TDJjbGkiLCJyaWQiOiJ1c2VyXzM3WU53Ym9adEN5OVdYa0tTWjlIWWw0QzloaCIsImluaXRpYWxzIjoiUlIifQ', true, 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtb3NjLnJlZ3VsYXIudXNlckBrZWxlbm8uY29tIiwicHVycG9zZSI6ImVtYWlsX3N1YnNjcmlwdGlvbiIsInRlbmFudElkIjoidGVuYW50X2RlbW9fMDAyIiwiZXhwIjoxNzgwMDM2NjkyLCJpYXQiOjE3Nzc0NDQ2OTIsInVzZXJJZCI6InVzZXJfMzhEam1FODBjamNqRmhhVmtXOGhRa2V1eWEyIiwiZW1haWwiOiJtb3NjLnJlZ3VsYXIudXNlckBrZWxlbm8uY29tIn0.BdIHs3CUzSyPA-v15PTUqGZTDpuhaxCFy6GXKY4REGg', false, 'PENDING_APPROVAL', 'MEMBER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-13 14:02:16.057', '2026-04-29 06:38:12.441532', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);`,
  `INSERT INTO public.user_profile (id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, clerk_user_id, clerk_session_id, clerk_org_id, clerk_org_role, auth_provider, auth_provider_user_id, email_verified, profile_image_url_clerk, last_sign_in_at, clerk_metadata, created_at, updated_at, request_id, request_reason, status, admin_comments, submitted_at, reviewed_at, approved_at, rejected_at) VALUES (610278, '${TENANT}', 'user_3CnyuK2mmwN5hldbcNueveBmoNl', '', '', 'mosc.admin.social@keleno.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18ydlFXRk5DSWkxaDQwbWZkTFk5T2t0TDJjbGkiLCJyaWQiOiJ1c2VyXzNDbnl1SzJtbXdONWhsZGJjTnVldmVCbW9ObCJ9', true, 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtb3NjLmFkbWluLnNvY2lhbEBrZWxlbm8uY29tIiwicHVycG9zZSI6ImVtYWlsX3N1YnNjcmlwdGlvbiIsInRlbmFudElkIjoidGVuYW50X2RlbW9fMDAyIiwiZXhwIjoxNzgwNDg3OTM1LCJpYXQiOjE3Nzc4OTU5MzUsInVzZXJJZCI6InVzZXJfM0NueXVLMm1td041aGxkYmNOdWV2ZUJtb05sIiwiZW1haWwiOiJtb3NjLmFkbWluLnNvY2lhbEBrZWxlbm8uY29tIn0.7ziucmoSv8Nu8U4yvfbIYp8RpBJejkCHVuVVSSLqEGg', false, 'APPROVED', 'MEMBER', '2026-05-04 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-24 13:04:11.704', '2026-05-04 11:58:55.779515', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);`,
  `INSERT INTO public.user_profile (id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, clerk_user_id, clerk_session_id, clerk_org_id, clerk_org_role, auth_provider, auth_provider_user_id, email_verified, profile_image_url_clerk, last_sign_in_at, clerk_metadata, created_at, updated_at, request_id, request_reason, status, admin_comments, submitted_at, reviewed_at, approved_at, rejected_at) VALUES (604101, '${TENANT}', 'user_2vVLxhPnsIPGYf6qpfozk383Slr', 'Gain', 'Joseph', 'giventauser@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydlZMeGVDUnFWTnpkTDBLUXMySXNWekFBVG8ifQ', true, 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnaXZlbnRhdXNlckBnbWFpbC5jb20iLCJwdXJwb3NlIjoiZW1haWxfc3Vic2NyaXB0aW9uIiwidGVuYW50SWQiOiJ0ZW5hbnRfZGVtb18wMDIiLCJleHAiOjE3ODA0ODc5NTAsImlhdCI6MTc3Nzg5NTk1MCwidXNlcklkIjoidXNlcl8ydlZMeGhQbnNJUEdZZjZxcGZvemszODNTbHIiLCJlbWFpbCI6ImdpdmVudGF1c2VyQGdtYWlsLmNvbSJ9.vxq513GAHMIam1XGd1PPhN4-sVKps5fNiQuosdJL0AA', false, 'APPROVED', 'ADMIN', '2026-05-04 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 00:24:33.657', '2026-05-04 11:59:10.627431', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);`,
  `INSERT INTO public.user_profile (id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, clerk_user_id, clerk_session_id, clerk_org_id, clerk_org_role, auth_provider, auth_provider_user_id, email_verified, profile_image_url_clerk, last_sign_in_at, clerk_metadata, created_at, updated_at, request_id, request_reason, status, admin_comments, submitted_at, reviewed_at, approved_at, rejected_at) VALUES (610838, '${TENANT}', 'user_3DJJHfUfC20KZ8FUL388aPEG5V9', '', '', 'jebin@keleno.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18ydlFXRk5DSWkxaDQwbWZkTFk5T2t0TDJjbGkiLCJyaWQiOiJ1c2VyXzNESkpIZlVmQzIwS1o4RlVMMzg4YVBFRzVWOSJ9', true, 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqZWJpbkBrZWxlbm8uY29tIiwicHVycG9zZSI6ImVtYWlsX3N1YnNjcmlwdGlvbiIsInRlbmFudElkIjoidGVuYW50X2RlbW9fMDAyIiwiZXhwIjoxNzgwNTg2MjgyLCJpYXQiOjE3Nzc5OTQyODIsInVzZXJJZCI6InVzZXJfM0RKSkhmVWZDMjBLWjhGVUwzODhhUEVHNVY5IiwiZW1haWwiOiJqZWJpbkBrZWxlbm8uY29tIn0.XmgDkwSPYNdaplw6S9FLvp0b0zAp_ztjC05X1wd8iQE', false, 'APPROVED', 'MEMBER', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-05 15:15:54.736', '2026-05-05 15:18:02.752783', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);`,
  `INSERT INTO public.user_profile (id, tenant_id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, zip_code, country, notes, family_name, city_town, district, educational_institution, profile_image_url, is_email_subscribed, email_subscription_token, is_email_subscription_token_used, user_status, user_role, reviewed_by_admin_at, reviewed_by_admin_id, clerk_user_id, clerk_session_id, clerk_org_id, clerk_org_role, auth_provider, auth_provider_user_id, email_verified, profile_image_url_clerk, last_sign_in_at, clerk_metadata, created_at, updated_at, request_id, request_reason, status, admin_comments, submitted_at, reviewed_at, approved_at, rejected_at) VALUES (605152, '${TENANT}', 'user_38nbubO0LEVuh1coatR0Rh4MEEa', 'Gain', 'Joseph', 'mosc.admin.user@keleno.com', '3123430073', '165 Hopkins Ave, APT #7', 'APT 7', 'Jersey City', 'NJ', '07306', 'United States', 'cvcvcvcvcvcvcvcvcvcvc', 'Joseph', 'vbvbvbvbv', 'idukki', 'bvbvbvbvbvbv', 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18ydlFXRk5DSWkxaDQwbWZkTFk5T2t0TDJjbGkiLCJyaWQiOiJ1c2VyXzM4bmJ1Yk8wTEVWdWgxY29hdFIwUmg0TUVFYSJ9', true, 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtb3NjLmFkbWluLnVzZXJAa2VsZW5vLmNvbSIsInB1cnBvc2UiOiJlbWFpbF9zdWJzY3JpcHRpb24iLCJ0ZW5hbnRJZCI6InRlbmFudF9kZW1vXzAwMiIsImV4cCI6MTc4MDU4NjI5OSwiaWF0IjoxNzc3OTk0Mjk5LCJ1c2VySWQiOiJ1c2VyXzM4bmJ1Yk8wTEVWdWgxY29hdFIwUmg0TUVFYSIsImVtYWlsIjoibW9zYy5hZG1pbi51c2VyQGtlbGVuby5jb20ifQ.RhyTwAZmHY5qVVnMrx8KODeqayFQnOAT9D54SaO0TWM', false, 'APPROVED', 'ADMIN', '2026-05-05 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-03 16:03:18.677', '2026-05-05 15:18:19.06196', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);`,
];

function isMoscProfileLine(line) {
  if (!line.includes('INSERT INTO public.user_profile')) return false;
  return line.includes(`'${TENANT}'`) || line.includes(`'${TENANT_TYPO}'`);
}

function main() {
  if (!fs.existsSync(TARGET)) {
    console.error('File not found:', TARGET);
    process.exit(1);
  }

  const lines = fs.readFileSync(TARGET, 'utf8').split(/\r?\n/);
  let removed = 0;
  const kept = [];

  for (const line of lines) {
    if (isMoscProfileLine(line)) {
      removed += 1;
      continue;
    }
    kept.push(line);
  }

  const marker = `-- MOSC user profiles (${TENANT}, +600000 IDs)`;
  let insertAt = kept.findIndex(
    (line) =>
      line.includes('INSERT INTO public.user_profile') &&
      line.includes("'event_site_manager_admin_1'"),
  );
  if (insertAt < 0) {
    insertAt = kept.findIndex((line) => line.includes('INSERT INTO public.event_details'));
  }
  if (insertAt < 0) insertAt = kept.length;

  const block = ['', marker, ...CANONICAL_PROFILES, ''];
  kept.splice(insertAt, 0, ...block);

  fs.writeFileSync(TARGET, kept.join('\n'), 'utf8');
  console.log(`Patched ${TARGET}`);
  console.log(`  Removed ${removed} stale MOSC user_profile row(s)`);
  console.log(`  Inserted ${CANONICAL_PROFILES.length} canonical profile(s) with 600k IDs`);
}

main();
