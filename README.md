## Intro

`npm audit` is great but...
1. there's no way to whitelist advisories so you don't see them again, and
2. if you run it all the time (eg: as part of CI) it'll block you.

## Usage

1. Run `npx @medic/audit-dependencies audit`. This will run `npm audit`. If you have any advisories, either fix them, or add the IDs to the `permitted` array in the `.auditrc.json` file, then run `audit` again.
2. In your CI add a step for `npx @medic/audit-dependencies check`. This will check your `package-lock.json` against the one that's been verified and fail if it's changed.
