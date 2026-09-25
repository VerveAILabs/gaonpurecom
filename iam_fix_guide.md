# IAM Permission Fix Guide

To resolve the Cloud Functions deployment failure, you need to grant the `Storage Object Viewer` role to the default Compute Engine service account.

### Instructions

1.  **Open the Google Cloud Console**: Go to the [IAM page](https://console.cloud.google.com/iam-admin/iam) for your project `gaonpure-fdefd`.
2.  **Locate the Service Account**: Look for the member named `1086191205122-compute@developer.gserviceaccount.com`. It usually has the name "Compute Engine default service account".
3.  **Edit Permissions**: Click the **Edit** (pencil) icon next to that member.
4.  **Add Role**:
    -   Click **ADD ANOTHER ROLE**.
    -   Search for and select **Storage Object Viewer**.
5.  **Save**: Click **SAVE**.

### Alternative: Bucket-Specific Permission (More Secure)

If you prefer to only grant access to the specific bucket:
1.  Go to the [Cloud Storage Browser](https://console.cloud.google.com/storage/browser).
2.  Find the bucket `gcf-sources-1086191205122-us-central1`.
3.  Click the three dots (Actions) and select **Edit access**.
4.  Click **ADD PRINCIPAL**.
5.  Enter `1086191205122-compute@developer.gserviceaccount.com`.
6.  Select the role **Storage Object Viewer**.
7.  Click **SAVE**.

### After Applying the Fix
Run the deployment command again:
```bash
firebase deploy
```
