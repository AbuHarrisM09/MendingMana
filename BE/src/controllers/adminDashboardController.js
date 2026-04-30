const { getAdminDashboardData } = require('../services/adminDashboardService');

async function getDashboard(req, res) {
  try {
    const data = await getAdminDashboardData();

    return res.status(200).json({
      message: 'Data dashboard admin berhasil diambil.',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Gagal mengambil data dashboard admin.',
    });
  }
}

module.exports = {
  getDashboard,
};
