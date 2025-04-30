const puppeteer = require('puppeteer');
const pa11y = require('pa11y');
const PDFDocument = require('pdfkit');
const AppError = require("../utils/AppError")
const Analytics = require('../model/analysisModel')
const User = require('../model/userModel')

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
            timeout: 30000,
            includeNotices: true,
            includeNotices: true
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
        // req.user is loggeduser
        const saved_analytics = await Analytics.create({
            url: url,
            issues: results.issues
        })
        const requestedIdObj = {
            id: saved_analytics.id,
            url: saved_analytics.url,
            time: saved_analytics.timestamp,
            issuesFound: saved_analytics.issues.length
        }
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { requestedIdArray: requestedIdObj } },
            { new: true, runValidators: true }
          );
        res.status(200).json({
            status: 'Success',
            data: {
                issues: saved_analytics.issues
            }
        })
    } catch(err) {
        return next(new AppError(err.message,404))
    } finally {
        await browser.close();
    }
}

const getReport = async(req,res,next) => {
    try{
        const {id} = req.params;
        const logged_user = await User.findById(req.user.id);
        if (!logged_user) {
            return next(new AppError('Invalid token or user not valid',404))
        }
        const mappedIdArray = logged_user.requestedIdArray.map(item=>item.id)
        if (!mappedIdArray.includes(id)) {
            return next(new AppError('Wrong analytics id!',404))
        }
        const analytics = await Analytics.findById(id)
        res.status(200).json({
            status: 'Success',
            data: {
                issues: analytics.issues
            }
        })
    }catch(err){
        return next(new AppError(err.message,502))
    }
}

const getPdf = async(req,res,next) => {
    try {
        const {id} = req.params;
        const logged_user = await User.findById(req.user.id);
        if (!logged_user) {
            return next(new AppError('Invalid token or user not valid',404))
        }
        const mappedIdArray = logged_user.requestedIdArray.map(item=>item.id)
        if (!mappedIdArray.includes(id)) {
            return next(new AppError('Wrong analytics id!',404))
        }
        const analytics = await Analytics.findById(id)
        const { url, issues } = analytics;
        
        // Create new PDF document
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=accessibility-report.pdf');
    
        doc.pipe(res); // pipe PDF stream to response
    
        // Add content to PDF
        doc.fontSize(20).text('Accessibility Report', { underline: true });
        doc.moveDown();
        doc.fontSize(14).text(`URL: ${url}`);
        doc.text(`Generated At: ${new Date().toLocaleString()}`);
        doc.moveDown();
    
        doc.fontSize(16).text('Issues Found:', { underline: true });
    
        issues.forEach((issue, index) => {
            doc.moveDown(0.5);
            doc.fontSize(12).text(`${index + 1}. Type: ${issue.type}`);
            doc.text(`Message: ${issue.message}`);
            doc.text(`Code: ${issue.code}`);
            doc.text(`Help: ${issue.helpUrl}`);
            doc.text(`Selector: ${issue.selector}`);
            doc.moveDown();
        });
    
        doc.end(); // finalize PDF
    } catch(err) {
        return next(new AppError(err.message,502))
    }
}

module.exports = {
    scanWebsite,
    getReport,
    getPdf
}