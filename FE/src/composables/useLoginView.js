import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { login, register } from "../services/authService";
import logo from "../assets/logo.jpeg";

export function useLoginView() {
  const router = useRouter();
  const authMode = ref("login");

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

  const fieldErrors = reactive({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  async function handleSubmit() {
    requestError.value = "";
    requestSuccess.value = "";
    try {
      if (authMode.value === "login" && !validateLoginForm()) return;
      if (authMode.value === "register" && !validateRegisterForm()) return;

      isSubmitting.value = true;
      const result =
        authMode.value === "login"
          ? await login({
              email: loginForm.email.trim(),
              password: loginForm.password,
            })
          : await register({
              fullName: registerForm.fullName.trim(),
              email: registerForm.email.trim(),
              password: registerForm.password,
            });

      requestSuccess.value =
        result?.message ||
        (authMode.value === "login"
          ? "Login berhasil."
          : "Registrasi berhasil, silakan login.");

      if (authMode.value === "login") {
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.user?.role || "member");
        localStorage.setItem("userFullName", result.user?.fullName || "");
        localStorage.setItem("userEmail", result.user?.email || "");
        if (result.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else if (authMode.value === "register") {
        registerForm.fullName = "";
        registerForm.email = "";
        registerForm.password = "";
        registerForm.confirmPassword = "";
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
    fieldErrors,
    showPassword,
    isSubmitting,
    requestError,
    requestSuccess,
    setMode,
    handleSubmit,
  };
}
