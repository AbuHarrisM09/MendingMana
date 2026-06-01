const { loginUser, registerUser, validateRegisterPayload, loginOrRegisterGoogleUser } = require('../services/authService');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email dan password wajib diisi.',
    });
  }

  try {
    const result = await loginUser({ email, password });

    if (!result.success) {
      return res.status(result.statusCode).json({
        message: result.message,
      });
    }

    return res.status(result.statusCode).json({
      message: result.message,
      ...result.data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
    });
  }
}

async function register(req, res) {
  const { fullName, email, password } = req.body;
  const validationMessage = validateRegisterPayload({ fullName, email, password });

  if (validationMessage) {
    return res.status(400).json({
      message: validationMessage,
    });
  }

  try {
    const result = await registerUser({
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    if (!result.success) {
      return res.status(result.statusCode).json({
        message: result.message,
      });
    }

    return res.status(result.statusCode).json({
      message: result.message,
      ...result.data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
    });
  }
}

async function googleLogin(req, res) {
  const { email, fullName, profileImageUrl } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({
      message: 'Email dan nama lengkap wajib disertakan.',
    });
  }

  try {
    const result = await loginOrRegisterGoogleUser({
      email: String(email).trim().toLowerCase(),
      fullName: String(fullName).trim(),
      profileImageUrl: profileImageUrl ? String(profileImageUrl).trim() : null,
    });

    if (!result.success) {
      return res.status(result.statusCode).json({
        message: result.message,
      });
    }

    return res.status(result.statusCode).json({
      message: result.message,
      ...result.data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server.',
    });
  }
}

module.exports = {
  login,
  register,
  googleLogin,
};