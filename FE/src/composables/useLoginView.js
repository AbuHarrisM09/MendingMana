import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { login, register, forgotPassword, resetPassword } from "../services/authService";
import logo from "../assets/logo.jpeg";
import { useToast } from "./useToast";

export function useLoginView() {
  const router = useRouter();
  const authMode = ref("login"); // 'login' | 'register' | 'forgot_password' | 'reset_password'

  const loginForm = reactive({
    email: "",
    password: "",
  });

  const registerForm = reactive({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const forgotForm = reactive({
    email: "",
  });

  const resetForm = reactive({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fieldErrors = reactive({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const showPassword = ref(false);
  const isSubmitting = ref(false);
  const requestError = ref("");
  const requestSuccess = ref("");

  function setMode(mode, options = {}) {
    const { keepSuccess = false } = options;
    authMode.value = mode;
    requestError.value = "";
    if (!keepSuccess) {
      requestSuccess.value = "";
    }
    clearErrors();
  }

  function clearErrors() {
    fieldErrors.fullName = "";
    fieldErrors.email = "";
    fieldErrors.password = "";
    fieldErrors.confirmPassword = "";
    fieldErrors.otp = "";
  }

  function validateLoginForm() {
    clearErrors();
    let isValid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!loginForm.email || !emailPattern.test(loginForm.email)) {
      fieldErrors.email = "Masukkan email yang valid.";
      isValid = false;
    }
    if (!loginForm.password || loginForm.password.length < 6) {
      fieldErrors.password = "Password minimal 6 karakter.";
      isValid = false;
    }
    return isValid;
  }

  function validateRegisterForm() {
    clearErrors();
    let isValid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registerForm.fullName || registerForm.fullName.trim().length < 3) {
      fieldErrors.fullName = "Nama lengkap minimal 3 karakter.";
      isValid = false;
    }
    if (!registerForm.email || !emailPattern.test(registerForm.email)) {
      fieldErrors.email = "Masukkan email yang valid.";
      isValid = false;
    }
    if (!registerForm.password || registerForm.password.length < 6) {
      fieldErrors.password = "Password minimal 6 karakter.";
      isValid = false;
    }
    if (registerForm.confirmPassword !== registerForm.password) {
      fieldErrors.confirmPassword = "Konfirmasi password tidak sama.";
      isValid = false;
    }
    return isValid;
  }

  function validateForgotForm() {
    clearErrors();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotForm.email || !emailPattern.test(forgotForm.email)) {
      fieldErrors.email = "Masukkan email yang valid.";
      return false;
    }
    return true;
  }

  function validateResetForm() {
    clearErrors();
    let isValid = true;
    if (!resetForm.otp || resetForm.otp.trim().length !== 6) {
      fieldErrors.otp = "Masukkan kode OTP 6 digit.";
      isValid = false;
    }
    if (!resetForm.newPassword || resetForm.newPassword.length < 6) {
      fieldErrors.password = "Password baru minimal 6 karakter.";
      isValid = false;
    }
    if (resetForm.confirmPassword !== resetForm.newPassword) {
      fieldErrors.confirmPassword = "Konfirmasi password tidak sama.";
      isValid = false;
    }
    return isValid;
  }

  async function handleSubmit() {
    requestError.value = "";
    requestSuccess.value = "";
    try {
      if (authMode.value === "login" && !validateLoginForm()) return;
      if (authMode.value === "register" && !validateRegisterForm()) return;
      if (authMode.value === "forgot_password" && !validateForgotForm()) return;
      if (authMode.value === "reset_password" && !validateResetForm()) return;

      isSubmitting.value = true;

      if (authMode.value === "login") {
        const result = await login({
          email: loginForm.email.trim(),
          password: loginForm.password,
        });

        requestSuccess.value = result?.message || "Login berhasil.";
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.user?.role || "member");
        localStorage.setItem("userFullName", result.user?.fullName || "");
        localStorage.setItem("userEmail", result.user?.email || "");
        localStorage.setItem("loginMethod", "local");
        
        const { showToast } = useToast();
        showToast(`Selamat datang kembali, ${result.user?.fullName || 'User'}!`, 'success');

        if (result.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else if (authMode.value === "register") {
        const result = await register({
          fullName: registerForm.fullName.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
        });

        requestSuccess.value = result?.message || "Registrasi berhasil, silakan login.";
        registerForm.fullName = "";
        registerForm.email = "";
        registerForm.password = "";
        registerForm.confirmPassword = "";
        setMode("login", { keepSuccess: true });
      } else if (authMode.value === "forgot_password") {
        const result = await forgotPassword(forgotForm.email.trim());

        requestSuccess.value = result?.message || "Kode OTP telah dikirim ke email Anda.";
        // Pindah ke form reset password, set email otomatis
        resetForm.email = forgotForm.email.trim();
        resetForm.otp = "";
        resetForm.newPassword = "";
        resetForm.confirmPassword = "";
        setMode("reset_password", { keepSuccess: true });
      } else if (authMode.value === "reset_password") {
        const result = await resetPassword({
          email: resetForm.email.trim(),
          otp: resetForm.otp.trim(),
          newPassword: resetForm.newPassword,
        });

        requestSuccess.value = result?.message || "Password berhasil diperbarui.";
        resetForm.email = "";
        resetForm.otp = "";
        resetForm.newPassword = "";
        resetForm.confirmPassword = "";
        setMode("login", { keepSuccess: true });
      }
    } catch (error) {
      requestError.value = error.message;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    logo,
    authMode,
    loginForm,
    registerForm,
    forgotForm,
    resetForm,
    fieldErrors,
    showPassword,
    isSubmitting,
    requestError,
    requestSuccess,
    setMode,
    handleSubmit,
  };
}
