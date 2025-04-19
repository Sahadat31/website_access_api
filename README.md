# website_access_api
Website Accessibility Api Repository

# API ENDPOINTS

# Submit URL to scan
POST   /api/v1/analysis/scan
# Fetch scan report       
GET    /api/v1/analysis/report/:id
# Create user (Sign Up)
POST   /api/v1/user/signup
# GET USER HISTORY
GET /api/v1/user/searchHistory
# Login 
POST   /api/v1/user/login
# Pdf report generated
GET /api/v1/analysis/report/:id/pdf


# USER JOURNEY
USER needs to be loggedin to use the scan and fetch report api
Once user scans a website user gets the accessibility report details of the website
Also the report is mapped with an id, that is stored in database

UserDocuments Collection
user id - user name - user email - user password - requested id's[issue id | ur | timestamp | number of issues]
AnalysisDocuments Collection
analysis id - url - timestamp - issues

