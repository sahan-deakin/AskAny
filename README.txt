STEP 5 - What to do with these files
======================================

1. Copy the tests/ folder into your askany project root

2. Run this to install test dependencies:
   npm install --save-dev jest supertest jest-junit

3. Replace sonar-project.properties with the one in this zip

4. Open your package.json and:
   - Replace the "scripts" section with the one in package-update.json
   - Add the "jest" section from package-update.json

5. Test locally:
   npm test

6. Commit and push:
   git add .
   git commit -m "add tests: auth and posts routes with coverage reporting"
   git push origin main
