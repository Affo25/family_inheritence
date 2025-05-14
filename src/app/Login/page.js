'use client'; // if you're in `app/` directory and using client-side logic like form state

import React, { useEffect ,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useLoginStore from '../stores/LoginStore';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import useUserRoleStore from '../stores/userRoleStore';



function SignInPage() {
  const router = useRouter();
  const setRole = useUserRoleStore((state) => state.setRole);
  const role = useUserRoleStore((state) => state.role);
  const { formData = { email: '', password: '', user_type:"" }, formErrors = {}, loading = false, setFormData, login } = useLoginStore();
 const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  useEffect(() => {
    // Initialize form data if needed
    if (!formData.email && !formData.password && !formData.user_type) {
      setFormData({ email: '', password: '',user_type:'' });
    }
  }, []);

  const handleRoleClick = (role) => {
    setRole(role);
    console.log("Selected Role:", role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.email || !formData.password || !formData.user_type) {
        toast.error('Please enter both email and password or select user role');
        return;
      }

      const userData = {
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type
      };
      console.log(userData);

      // Call login function from store
      const result = await login(userData);

      if (result && result.success) {
        console.log("Login successful, redirecting...",result);
        // Use window.location for a hard navigation
        //window.location.href = '/Dashboard/layout';
        const userRole = result.user?.userRole;
        setRole(userRole);
        console.log(result.userRole);
        router.push("/Dashboard");

      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="nk-app-root bg-dark nk-blocks d-flex flex-column min-vh-100">
      <div
        className="container bg-dark-grey bg-gradient py-5 d-flex align-items-center justify-content-center flex-grow-1"
        style={{
          maxWidth: '600px',
          maxHeight: '800px',
          borderRadius: '10px',
          boxShadow: 'rgba(236, 191, 43, 0.2) 0px 2px 8px 0px',
          marginTop: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div className="w-100">
          <div className="nk-auth-body">
            <div className="brand-logo text-center mb-4">
              <Link href="/" className="logo-link">
                <Image
                  className="logo-light logo-img logo-img-lg"
                  src="/images/logo.png"
                  srcSet="/images/logo2x.png 2x"
                  alt="logo"
                  width={200}
                  height={60}
                />
                <Image
                  className="logo-dark logo-img logo-img-lg"
                  src="/images/logo-dark.png"
                  srcSet="/images/logo-dark2x.png 2x"
                  alt="logo-dark"
                  width={200}
                  height={60}
                />
              </Link>
            </div>
  
            <div className="nk-block-head text-center">
              <div className="nk-block-head-content">
                <h5 style={{ color: '#fff' }} className="nk-block-title">LOG IN</h5>
                <p style={{ color: '#fff' }}>Login Yourself to Use Dashboard</p>
              </div>
            </div>
  
           <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="form-label-group">
                  <label style={{color:"#fff"}} className="form-label" htmlFor="email">Email or Username</label>
                </div>
                <input
                  type="text"
                  className={`form-control form-control-lg ${formErrors?.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData?.email || ''}
                  onChange={handleChange}
                  placeholder="Enter your email address or username"
                />
                {formErrors?.email && (
                  <div className="invalid-feedback">{formErrors.email}</div>
                )}
              </div>

              <div className="form-group">
                <div className="form-label-group">
                  <label  style={{color:"#fff"}} className="form-label" htmlFor="password">Passcode</label>
                </div>
                <div className="form-control-wrap">
                  <a onClick={togglePassword} tabIndex="-1" href="#" className="form-icon form-icon-right passcode-switch" data-target="password">
                    <em className="passcode-icon icon-show icon ni ni-eye"></em>
                    <em className="passcode-icon icon-hide icon ni ni-eye-off"></em>
                  </a>
                  <input
                   type={showPassword ? 'text' : 'password'}
                    className={`form-control form-control-lg ${formErrors?.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData?.password || ''}
                    onChange={handleChange}
                    placeholder="Enter your passcode"
                  />
                  {formErrors?.password && (
                    <div className="invalid-feedback">{formErrors.password}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-group">
                  <label style={{color:"#fff"}} className="form-label" htmlFor="user_type">User Type</label>
                </div>
                <div className="form-control-wrap">
                  <select
                    className={`form-control form-control-lg ${formErrors?.user_type ? 'is-invalid' : ''}`}
                    id="user_type"
                    name="user_type"
                    value={formData?.user_type || ''}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select User role</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                  {formErrors?.user_type && (
                    <div className="invalid-feedback">{formErrors.user_type}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <button
                  type="submit"
                  className="btn btn-lg btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
              <div className="nk-block-head text-center">
              <div className="nk-block-head-content">
                <h5 style={{ color: '#fff' }} className="nk-block-title">Register Yourself to login? <Link href="/SignUp"><span>Sign up</span></Link></h5>
              </div>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
