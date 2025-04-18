const puppeteer = require('puppeteer');
const pa11y = require('pa11y');
const AppError = require("../utils/AppError")

const scanWebsite = async(req,res,next) => {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ headless: true });
    try {
        const { url } = req.body; 
        // Create a custom page in the browser
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
    
        // Use pa11y with Puppeteer
        const results = await pa11y(url, {
            browser, // use the same Puppeteer instance
            page,    // use current page context
            standard: 'WCAG2AA',
            timeout: 30000
        });
    
        console.log(`Accessibility results for: ${url}`);
        console.log('Issues found:', results.issues.length);
        // results.issues.forEach(issue => {
        //     console.log(`
        //         ⚠️ Type: ${issue.type}
        //         📝 Message: ${issue.message}
        //         📌 Code: ${issue.code}
        //         🔗 Help: ${issue.helpUrl}
        //         ➡️ Selector: ${issue.selector}
        //     `);
        // });
        res.status(200).json({
            status: 'Success',
            data: {
                results
            }
        })
    } catch(err) {
        return next(new AppError(err.message,404))
    } finally {
        await browser.close();
    }
}

module.exports = {
    scanWebsite
}