import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Import the custom hook for global authentication state
import { useAuth } from '../contexts/UserContext.js'; 
// Import the ReturnButton component using the established NAMED IMPORT
import { ReturnButton } from '../components/ReturnButton.js'; 

// Backend server port
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`;


// Country phone codes mapping
const COUNTRY_PHONE_CODES = {
    'Afghanistan': '+93',
    'Albania': '+355',
    'Algeria': '+213',
    'Argentina': '+54',
    'Australia': '+61',
    'Austria': '+43',
    'Bangladesh': '+880',
    'Belgium': '+32',
    'Brazil': '+55',
    'Canada': '+1',
    'China': '+86',
    'Denmark': '+45',
    'Egypt': '+20',
    'Finland': '+358',
    'France': '+33',
    'Germany': '+49',
    'Greece': '+30',
    'India': '+91',
    'Indonesia': '+62',
    'Iran': '+98',
    'Iraq': '+964',
    'Ireland': '+353',
    'Israel': '+972',
    'Italy': '+39',
    'Japan': '+81',
    'Jordan': '+962',
    'Lebanon': '+961',
    'Malaysia': '+60',
    'Mexico': '+52',
    'Netherlands': '+31',
    'Norway': '+47',
    'Pakistan': '+92',
    'Philippines': '+63',
    'Poland': '+48',
    'Portugal': '+351',
    'Russia': '+7',
    'Saudi Arabia': '+966',
    'Singapore': '+65',
    'South Africa': '+27',
    'South Korea': '+82',
    'Spain': '+34',
    'Sweden': '+46',
    'Switzerland': '+41',
    'Syria': '+963',
    'Thailand': '+66',
    'Turkey': '+90',
    'Ukraine': '+380',
    'United Arab Emirates': '+971',
    'United Kingdom': '+44',
    'United States': '+1',
    'Vietnam': '+84'
};

const RegisterPage = () => {
    const navigate = useNavigate();
    // Use useAuth to get authentication status
    const { isAuthenticated } = useAuth();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        nationality: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        paymentMethod: 'omt' // Default to OMT since free month is automatic
    });
    const [message, setMessage] = useState('');
    const [ageError, setAgeError] = useState('');
    const [passwordError, setPasswordError] = useState(''); // NEW: State for password strength error
    const [phoneCode, setPhoneCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // NEW: State for toggling password visibility
    
    // Redirect authenticated users away from registration page
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true }); 
        }
    }, [isAuthenticated, navigate]); 

    // --- NEW: Password Validation Logic ---
    const validatePassword = (password) => {
        // Must be at least 8 characters
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        // Must contain at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter.';
        }
        // Must contain at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter.';
        }
        // Must contain at least one number
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number.';
        }
        // Must contain at least one special character
        if (!/[^A-Za-z0-9]/.test(password)) {
            return 'Password must contain at least one special character (e.g., !@#$%^&*).';
        }
        return ''; // Return empty string if valid
    };

    // Calculate age from birth date
    const calculateAge = (day, month, year) => {
        if (!day || !month || !year) return null;
        
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    // Validate age whenever birth date changes
    useEffect(() => {
        const age = calculateAge(formData.birthDay, formData.birthMonth, formData.birthYear);
        if (age !== null) {
            if (age < 18) {
                setAgeError('You must be at least 18 years old to register');
            } else {
                setAgeError('');
            }
        } else {
            setAgeError('');
        }
    }, [formData.birthDay, formData.birthMonth, formData.birthYear]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Update phone code when nationality changes
        if (name === 'nationality') {
            const code = COUNTRY_PHONE_CODES[value] || '';
            setPhoneCode(code);
            // Clear existing phone number when nationality changes
            setFormData(prev => ({ ...prev, [name]: value, phone: code ? `${code} ` : '' }));
            return;
        }

        // NEW: Validate password on change
        if (name === 'password') {
            const error = validatePassword(value);
            setPasswordError(error);
        }
    };

    const handlePhoneChange = (e) => {
        const { value } = e.target;
        // Allow user to freely edit phone number including removing the phone code
        setFormData({ ...formData, phone: value });
    };

    // NEW: Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate age before submission
        const age = calculateAge(formData.birthDay, formData.birthMonth, formData.birthYear);
        if (age === null || age < 18) {
            setMessage('Registration failed: You must be at least 18 years old');
            return;
        }

        // NEW: Validate password strength before submission
        const passError = validatePassword(formData.password);
        if (passError) {
            setMessage('Registration failed: Please use a stronger password.');
            setPasswordError(passError); // Ensure the error is shown visually
            return;
        }
        
        setIsLoading(true);
        setMessage('Creating your account...');

        try {
            // Include calculated age in the submission data
            const submissionData = {
                ...formData,
                age: age,
                dateOfBirth: `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
            };
            
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, submissionData);
            setMessage('Registration successful! Redirecting to login...');
            
            // Redirect to login after successful registration
            setTimeout(() => navigate('/login'), 2000); 

        } catch (error) {
            // Display a more specific error if available
            const errorMessage = error.response?.data?.message || 
                               'Registration failed: Could not connect to the server (check backend terminal).';
            setMessage(errorMessage);
            console.error('Registration Error:', error.response || error);
        } finally {
            setIsLoading(false);
        }
    };

    // Modern styles with neutral/transparent background
    const containerStyle = {
        minHeight: '100vh',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
         position: 'relative' // Needed for absolute button
    };

    const formBoxStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'slideUp 0.6s ease-out'
    };

    const titleStyle = {
        fontSize: '32px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center',
        marginBottom: '8px',
        letterSpacing: '-0.5px'
    };

    const subtitleStyle = {
        color: '#64748b',
        textAlign: 'center',
        marginBottom: '40px',
        fontSize: '16px',
        fontWeight: '400'
    };

    const inputStyle = {
        width: '100%',
        padding: '16px 20px',
        marginBottom: '20px',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        backgroundColor: '#ffffff',
        outline: 'none',
        fontFamily: 'inherit'
    };
    
    // NEW: Style for the password container (to hold input and toggle)
    const passwordContainerStyle = {
        position: 'relative',
        marginBottom: '20px',
    };

    // NEW: Style for the password toggle button
    const passwordToggleStyle = {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        color: '#64748b',
        padding: '0',
        outline: 'none'
    };

    const buttonStyle = {
        width: '100%',
        padding: '18px',
        background: isLoading 
            ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
            : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: isLoading || !!ageError || !!passwordError ? 'not-allowed' : 'pointer', // Check password error here
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        marginTop: '24px',
        boxShadow: '0 8px 24px rgba(55, 65, 81, 0.3)',
        fontFamily: 'inherit',
        opacity: isLoading || !!ageError || !!passwordError ? 0.7 : 1, // Dim button if errors exist
    };

    const errorStyle = {
        color: '#ef4444',
        fontSize: '14px',
        marginTop: '-15px',
        marginBottom: '15px',
        textAlign: 'left',
        fontWeight: '500'
    };

    const freeMonthStyle = {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
        border: 'none'
    };

    const paymentSectionStyle = {
        background: '#f8fafc',
        border: '2px solid #e2e8f0',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px'
    };

    const radioLabelStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        marginBottom: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '15px',
        fontWeight: '500'
    };

    const radioInputStyle = {
        marginRight: '12px',
        transform: 'scale(1.2)'
    };

    const backButtonStyle = {
        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
    };

    // Get sorted country list for dropdown
    const countryList = Object.keys(COUNTRY_PHONE_CODES).sort();

    // Generate arrays for day, month, year options
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    
    const animationStyles = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.7;
            }
        }
        
        .loading {
            animation: pulse 2s infinite;
        }
        
        .input-focus:focus {
            border-color: #374151 !important;
            box-shadow: 0 0 0 4px rgba(55, 65, 81, 0.1) !important;
            transform: translateY(-2px) !important;
        }
        
        .button-hover:hover:not(:disabled) {
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 32px rgba(55, 65, 81, 0.4) !important;
        }
        
        .radio-hover:hover {
            background-color: #f1f5f9 !important;
        }

        .back-button-hover:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(107, 114, 128, 0.4) !important;
        }

        .password-input {
            padding-right: 50px !important; /* Make room for the toggle button */
            margin-bottom: 0 !important;
        }
    `;

    return (
        <>
            <style>{animationStyles}</style>
            <div style={containerStyle}>
                <div style={formBoxStyle}>
                    <h1 style={titleStyle}>Join POLYNEWS</h1>
                    <p style={subtitleStyle}>Create your account and stay informed</p>
                    
                    {message && 
                        <div style={{
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            textAlign: 'center',
                            fontWeight: '500',
                            background: message.includes('successful') 
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            boxShadow: message.includes('successful')
                                ? '0 8px 24px rgba(16, 185, 129, 0.3)'
                                : '0 8px 24px rgba(239, 68, 68, 0.3)'
                        }}>
                            {message}
                        </div>
                    }
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '4px' }}>
                            <input 
                                type="text" 
                                name="firstName" 
                                placeholder="First Name" 
                                value={formData.firstName}
                                onChange={handleChange} 
                                required 
                                className="input-focus"
                                style={inputStyle} 
                            />
                            
                            <input 
                                type="text" 
                                name="lastName" 
                                placeholder="Last Name" 
                                value={formData.lastName}
                                onChange={handleChange} 
                                required 
                                className="input-focus"
                                style={inputStyle} 
                            />
                        </div>
                        
                        <select 
                            name="nationality" 
                            value={formData.nationality}
                            onChange={handleChange} 
                            required 
                            className="input-focus"
                            style={{
                                ...inputStyle, 
                                color: formData.nationality ? '#1e293b' : '#64748b',
                                fontWeight: formData.nationality ? '500' : '400'
                            }}
                        >
                            <option value="" disabled>Select Your Nationality</option>
                            {countryList.map(country => (
                                <option key={country} value={country}>
                                    {country} ({COUNTRY_PHONE_CODES[country]})
                                </option>
                            ))}
                        </select>
                        
                        {/* Date of Birth Section */}
                        <div style={{ marginBottom: '4px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                color: '#374151', 
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>
                                Date of Birth (must be 18+)
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px' }}>
                                <select 
                                    name="birthDay" 
                                    value={formData.birthDay}
                                    onChange={handleChange} 
                                    required 
                                    className="input-focus"
                                    style={{
                                        ...inputStyle, 
                                        marginBottom: '0',
                                        color: formData.birthDay ? '#1e293b' : '#64748b',
                                        fontWeight: formData.birthDay ? '500' : '400'
                                    }}
                                >
                                    <option value="" disabled>Day</option>
                                    {days.map(day => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                
                                <select 
                                    name="birthMonth" 
                                    value={formData.birthMonth}
                                    onChange={handleChange} 
                                    required 
                                    className="input-focus"
                                    style={{
                                        ...inputStyle, 
                                        marginBottom: '0',
                                        color: formData.birthMonth ? '#1e293b' : '#64748b',
                                        fontWeight: formData.birthMonth ? '500' : '400'
                                    }}
                                >
                                    <option value="" disabled>Month</option>
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                                
                                <select 
                                    name="birthYear" 
                                    value={formData.birthYear}
                                    onChange={handleChange} 
                                    required 
                                    className="input-focus"
                                    style={{
                                        ...inputStyle, 
                                        marginBottom: '0',
                                        color: formData.birthYear ? '#1e293b' : '#64748b',
                                        fontWeight: formData.birthYear ? '500' : '400'
                                    }}
                                >
                                    <option value="" disabled>Year</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {ageError && <p style={{...errorStyle, marginTop: '10px'}}>{ageError}</p>}
                        </div>
                        
                        <select 
                            name="gender" 
                            value={formData.gender}
                            onChange={handleChange} 
                            required 
                            className="input-focus"
                            style={{
                                ...inputStyle, 
                                color: formData.gender ? '#1e293b' : '#64748b',
                                fontWeight: formData.gender ? '500' : '400'
                            }}
                        >
                            <option value="" disabled>Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                        
                        <input 
                            type="tel" 
                            name="phone" 
                            placeholder={phoneCode ? `${phoneCode} Phone Number` : "Phone Number (select nationality first)"}
                            value={formData.phone}
                            onChange={handlePhoneChange} 
                            required 
                            className="input-focus"
                            style={{
                                ...inputStyle,
                                backgroundColor: !phoneCode ? '#f8fafc' : '#ffffff',
                                cursor: !phoneCode ? 'not-allowed' : 'text'
                            }}
                            disabled={!phoneCode}
                        />
                        
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email Address" 
                            value={formData.email}
                            onChange={handleChange} 
                            required 
                            className="input-focus"
                            style={inputStyle} 
                        />
                        
                        {/* NEW: Password Input with Toggle Button */}
                        <div style={passwordContainerStyle}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                placeholder="Password (Min 8 chars, incl. A, a, 1, !)" 
                                value={formData.password}
                                onChange={handleChange} 
                                required 
                                className="input-focus password-input"
                                style={inputStyle} 
                            />
                            <button 
                                type="button"
                                onClick={togglePasswordVisibility}
                                style={passwordToggleStyle}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '👁️' : '🔒'}
                            </button>
                        </div>
                        {passwordError && <p style={{...errorStyle, marginTop: '-20px'}}>{passwordError}</p>}
                        
                        {/* Free Month Notice */}
                        <div style={freeMonthStyle}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
                                Welcome Bonus!
                            </h3>
                            <p style={{ margin: '0', fontSize: '15px', opacity: '0.95' }}>
                                Your first month is completely **FREE** - no strings attached!
                            </p>
                        </div>
                        
                        <div style={paymentSectionStyle}>
                            <h4 style={{
                                margin: '0 0 20px 0', 
                                color: '#1e293b', 
                                fontWeight: '600',
                                fontSize: '16px'
                            }}>
                                Choose Payment Method (after free month)
                            </h4>
                            
                            <label 
                                className="radio-hover"
                                style={{
                                    ...radioLabelStyle,
                                    backgroundColor: formData.paymentMethod === 'omt' ? '#eff6ff' : 'transparent',
                                    border: formData.paymentMethod === 'omt' ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                            >
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="omt" 
                                    checked={formData.paymentMethod === 'omt'} 
                                    onChange={handleChange} 
                                    style={radioInputStyle}
                                />
                                <span>**$5/month** via OMT</span>
                            </label>
                            
                            <label 
                                className="radio-hover"
                                style={{
                                    ...radioLabelStyle,
                                    backgroundColor: formData.paymentMethod === 'bank' ? '#eff6ff' : 'transparent',
                                    border: formData.paymentMethod === 'bank' ? '2px solid #3b82f6' : '2px solid transparent',
                                    marginBottom: '0'
                                }}
                            >
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="bank" 
                                    checked={formData.paymentMethod === 'bank'} 
                                    onChange={handleChange} 
                                    style={radioInputStyle}
                                />
                                <span>**$5/month** via Wish Bank Account</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className={`button-hover ${isLoading ? 'loading' : ''}`}
                            style={buttonStyle}
                            disabled={!!ageError || !!passwordError || isLoading} // Disable on password error
                        >
                            {isLoading ? 'Creating Account...' : 'Create My Account'}
                        </button>
                    </form>
                    
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <button 
                            onClick={() => navigate('/')}
                            className="back-button-hover"
                            style={backButtonStyle}
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;