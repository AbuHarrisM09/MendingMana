const adminReviewModel = require('../models/adminReviewModel');

async function getReports(req, res) {
  try {
    const { search = '', status = 'all', page = 1, limit = 15 } = req.query;

    const result = await adminReviewModel.getAllReports({
      search: String(search),
      status: String(status),
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(50, Math.max(1, Number(limit) || 15)),
    });

    return res.status(200).json({
      message: 'Daftar laporan ulasan berhasil diambil.',
      data: {
        reports: result.reports,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('getReports error:', error);
    return res.status(500).json({
      message: 'Gagal mengambil daftar laporan ulasan.',
    });
  }
}

async function handleReport(req, res) {
  try {
    const reportId = req.params.id;
    const { action, note } = req.body;
    const adminUserId = req.user.sub;

    if (!['resolved', 'rejected'].includes(action)) {
      return res.status(400).json({
        message: 'Tindakan tidak valid. Harus "resolved" atau "rejected".',
      });
    }

    const report = await adminReviewModel.findReportById(reportId);
    if (!report) {
      return res.status(404).json({
        message: 'Laporan tidak ditemukan.',
      });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({
        message: 'Laporan ini sudah diproses sebelumnya.',
      });
    }

    if (action === 'rejected') {
      // Abaikan laporan
      const updatedReport = await adminReviewModel.updateReportStatus(reportId, {
        status: 'rejected',
        handledBy: adminUserId,
        handledNote: note || null,
      });

      return res.status(200).json({
        message: 'Laporan berhasil diabaikan.',
        data: updatedReport,
      });
    } else if (action === 'resolved') {
      // Hapus ulasan & selesaikan semua laporan terkait ulasan tersebut
      const reviewId = report.review_id;

      // Soft delete ulasan
      await adminReviewModel.softDeleteReview(reviewId);

      // Resolve semua laporan pending untuk review tersebut
      await adminReviewModel.resolveAllReportsForReview(reviewId, {
        handledBy: adminUserId,
        handledNote: note || 'Ulasan dihapus oleh admin karena melanggar ketentuan.',
      });

      // Juga update laporan saat ini secara eksplisit
      const currentReportUpdated = await adminReviewModel.updateReportStatus(reportId, {
        status: 'resolved',
        handledBy: adminUserId,
        handledNote: note || 'Ulasan dihapus oleh admin karena melanggar ketentuan.',
      });

      return res.status(200).json({
        message: 'Ulasan berhasil dihapus dan semua laporan terkait telah diselesaikan.',
        data: currentReportUpdated,
      });
    }
  } catch (error) {
    console.error('handleReport error:', error);
    return res.status(500).json({
      message: 'Gagal memproses laporan ulasan.',
    });
  }
}

module.exports = {
  getReports,
  handleReport,
};
