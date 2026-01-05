import React from 'react';

export default function Footer() {
    const copyrightYear = 2025;
    const phoneNumber = '0096171146914';
    const formattedPhoneNumber = '+961 71 146 914';

    return (
        <footer style={{
            backgroundColor: '#9dcbfaff',
            color: '#ffffffff',
            padding: '8px 10px',          // ⬅ smaller
            //borderTop: '1px solid #ffffffff',
            boxShadow: '0 -3px 4px rgba(255, 182, 255, 1)',
            marginTop: '5px',
            fontSize: '0.9em',            // ⬅ smaller text
            fontWeight: 'bold',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                maxWidth: '1100px',
                margin: '0 auto',
                gap: '15px',               // ⬅ smaller gap
                padding: '0 10px'
            }}>

                {/* About */}
                <div style={footerSectionStyle}>
                    <h3 style={footerHeadingStyle}>About Us</h3>
                    <p style={{ lineHeight: '1.4', fontSize: '1em' }}>
                        Your window to the world. Access every headline, in any language — translated, summarized, and spoken by AI, so you never miss a story.
                    </p>
                </div>

                {/* Contact */}
                <div style={footerSectionStyle}>
                    <h3 style={footerHeadingStyle}>Contact Us</h3>
                    <p style={{ fontSize: '1em' }}>
                        Email: <a href="mailto:sacha.faouz@gmail.com" style={footerLinkStyle}>sacha.faouz@gmail.com</a>
                    </p>
                    <p style={{ fontSize: '0.9em' }}>
                        Phone: <a href={`tel:${phoneNumber}`} style={footerLinkStyle}>{formattedPhoneNumber}</a>
                    </p>
                </div>

                {/* Links */}
                <div style={footerSectionStyle}>
                    <h3 style={footerHeadingStyle}>Quick Links</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li><a href="#" style={footerLinkStyle}>Articles</a></li>
                        <li><a href="#" style={footerLinkStyle}>Privacy Policy</a></li>
                        <li><a href="#" style={footerLinkStyle}>Terms</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom */}
            <div style={{
                textAlign: 'center',
                marginTop: '15px',          // ⬅ smaller
                paddingTop: '8px',          // ⬅ smaller
                borderTop: '2px solid #460357ff',
                fontSize: '0.8em'
            }}>
                © {copyrightYear} Sacha Faouz. All rights reserved | Built with Node.js & React.
            </div>
        </footer>
    );
}

/* ===== Styles ===== */

const footerSectionStyle = {
    flex: '1',
    minWidth: '200px',
    marginBottom: '10px',               // ⬅ smaller
    textAlign: 'left'
};

const footerHeadingStyle = {
    color: '#460357ff',
    marginBottom: '15px',               // ⬅ smaller
    fontSize: '1em'                     // ⬅ smaller
};

const footerLinkStyle = {
    color: '#030f57ff',
    textDecoration: 'none',
    fontSize: '0.9em'
};
