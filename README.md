# NumPal Modular Workspace
# https://digitalsolutionssne-bit.github.io/Numeracy-Exp/

This repository has been restructured to facilitate modular development, isolated environments, and automated deployments for both the GitHub Pages frontend and the Google Apps Script backend.

## Architecture & Folder Structure

- `frontend/`: Contains all client-side code.
  - `css/`: Stylesheets.
  - `pages/`: HTML views for the application.
  - `js/`: Modular JavaScript logic.
    - `core/`: Core initialization and configurations (`config.js`, `app.js`).
    - `utils/`: Shared utilities (`ui.js`, `rolodex.js`).
    - `pages/`: Page-specific scripts, directly mapping to HTML views.
- `backend/`: Contains Google Apps Script backend logic.
- `assets/`: Contains images and application icons.
- `.github/workflows/`: Contains GitHub Actions for continuous deployment.

## Environment Management

You can toggle between the 3 environments (Exp, Dev, Prod) by altering the `ENV` constant inside `frontend/js/core/config.js`. 
- **Dev**: Displays a persistent red `Testing` banner.
- **Exp**: Displays a persistent purple `Experimentation` banner.
- **Prod**: Operates normally with no banner.

## Automated Backend Deployment (Google Apps Script)

This repository includes a GitHub Action to automatically deploy changes made in the `backend/` folder directly to Google Apps Script using `clasp`. This workflow will push the code and **update your existing Web App URL** seamlessly, without needing a hardcoded `.clasp.json` file in the repo.

### Setup Instructions:

**Part 1: Authenticate Clasp and Get Credentials via GitHub Codespaces**
1. Navigate to your repository on GitHub.
2. Click the green **Code** button, switch to the **Codespaces** tab, and click **Create codespace on main**.
3. Once the web editor loads, open the terminal (View > Terminal).
4. Install clasp globally in your codespace: `npm install -g @google/clasp`
5. Run the authentication command: `clasp login --no-localhost`
6. Clasp will provide a URL in the terminal. Open that URL in a new browser tab, log in with your Google account, and grant permissions.
7. You will be given an authorization code. Copy it, paste it back into your Codespaces terminal, and press Enter. 
8. Run the command `cat ~/.clasprc.json` in the terminal. Copy the entire JSON output displayed. You will need this for the `CLASP_CREDENTIALS` secret.

**Part 2: Retrieve IDs via Google Apps Script Browser UI**
1. Open your project in the [Google Apps Script editor](https://script.google.com/).
2. **Get Script ID:** Click on **Project Settings** (the gear icon) on the left sidebar. Under the "IDs" section, copy the **Script ID**.
3. **Get Deployment ID:** You must have deployed your Google Apps Script as a Web App at least once. Click on the blue **Deploy** button (top right) > **Manage deployments**. Select your active Web App deployment from the list on the left, and copy the **Deployment ID** from the right pane.

**Part 3: Add GitHub Secrets**
Go to your GitHub repository **Settings > Secrets and variables > Actions** and add the following 3 Repository Secrets:
1. `GAS_SCRIPT_ID`: Paste your Apps Script Project ID here.
2. `GAS_DEPLOYMENT_ID`: Paste the Deployment ID you copied here.
3. `CLASP_CREDENTIALS`: Paste the credentials JSON you copied in Part 1. *(Note: The workflow is explicitly built to parse custom dictionary formats containing `tokens.default` as well as native `.clasprc.json` formats).*

Future commits to the `main` branch that modify files in the `backend/` directory will now trigger the workflow, dynamically create the `.clasp.json` configuration on the server, push the code, and publish a new version without changing your Web App URL.