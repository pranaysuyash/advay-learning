# Beta Launch Event Taxonomy

## Principles
- First-party only
- No raw child media
- No passwords, verification codes, or unnecessary PII in event payloads
- Parent/account interactions and child/gameplay interactions share one local event stream but use explicit event names

## Parent/account funnel
- `page_view`
- `cta_clicked`
- `nav_link_clicked`
- `register_started`
- `register_completed`
- `register_failed`
- `login_started`
- `login_completed`
- `login_failed`
- `email_verification_sent`
- `email_verification_completed`
- `email_verification_failed`

## Consent and trust
- `consent_started`
- `consent_email_sent`
- `consent_code_submitted`
- `consent_completed`
- `consent_failed`
- `consent_abandoned`
- `camera_permission_prompted`
- `camera_permission_granted`
- `camera_permission_denied`

## Profile and identity
- `child_profile_created`
- `child_profile_selected`
- `child_profile_deleted`
- `local_avatar_selected`

## Game and progress
- `game_launched`
- `game_session_started`
- `game_session_ended`
- `progress_queued`
- `progress_queue_failed`

## Beta conversion and support
- `beta_pricing_viewed`
- `pricing_interest_clicked`
- `subscription_blocked_for_beta`
- `support_contact_clicked`

## Parent rights
- `export_summary_viewed`
- `export_requested`
- `export_downloaded`
- `account_delete_initiated`
- `account_delete_completed`
- `account_delete_cancelled`
- `profile_delete_initiated`
- `profile_delete_completed`
- `profile_delete_cancelled`

## Reliability
- `recoverable_client_error`
- `fatal_client_error`
- `api_failure`
