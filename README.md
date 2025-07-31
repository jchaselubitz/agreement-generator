# Line of Credit Agreement Generator

A modern web application for generating professional line of credit agreements with real-time preview and PDF export functionality.

## Project Structure

The application has been refactored into separate components for better maintainability:

```
agreement-generator/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styles and responsive design
├── script.js           # JavaScript functionality and form handling
└── README.md          # This documentation
```

## Features

- **Real-time Preview**: Form fields update the contract display instantly
- **GBP Conversion**: Credit limit shown in USD with real-time GBP equivalent for informational purposes
- **Responsive Design**: Works on desktop and mobile devices
- **PDF Export**: Generate professional PDF documents using browser print functionality
- **Form Validation**: Ensures required fields are completed before PDF generation
- **Modern UI**: Clean, professional interface with smooth animations
- **Payment Tracking**: Enter payments to see principal/interest breakdown and current balance
- **CSV History**: Export withdrawals/payments to CSV and import later to restore them

## Usage

1. **Open the Application**: Simply open `index.html` in any modern web browser
2. **Fill Out the Form**: Enter the required information in the left panel
3. **Preview the Contract**: Watch the contract update in real-time on the right panel
4. **Generate PDF**: Click the "Generate PDF" button to create a printable document
5. **Save or Load History**: In the Payment Calculator, export or import CSV files for draws and payments

## Required Fields

- Lender Full Name
- Borrower Full Name  
- Credit Limit (USD)

## Technical Details

### HTML Structure (`index.html`)
- Clean semantic HTML5 markup
- Form section with all input fields
- Contract preview section
- External CSS and JavaScript references

### Styling (`styles.css`)
- Modern CSS with flexbox and grid layouts
- Responsive design with mobile breakpoints
- Print-specific styles for PDF generation
- Smooth animations and hover effects

### Functionality (`script.js`)
- Form field mapping and real-time updates
- Date initialization and validation
- PDF generation using browser print API
- Success/error message handling

## Browser Compatibility

- Chrome (recommended for PDF generation)
- Firefox
- Safari
- Edge

## Development

To modify the application:

1. **Update Contract Template**: Edit the contract content in `index.html`
2. **Modify Styling**: Update `styles.css` for visual changes
3. **Add Functionality**: Extend `script.js` for new features
4. **Add Form Fields**: Update both HTML and JavaScript field mappings

## PDF Generation

The application uses the browser's built-in print functionality to generate PDFs. This approach:
- Requires no external dependencies
- Works across all modern browsers
- Produces high-quality, print-ready documents
- Maintains consistent formatting

## License

This project is open source and available under the MIT License. 