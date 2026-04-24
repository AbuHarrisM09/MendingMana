const { loginUser } = require('../services/authService');

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

module.exports = {
  login,
};
