const adminUserModel = require('../models/adminUserModel');

async function getUsers(req, res) {
  try {
    const { search = '', status = 'all', page = 1, limit = 15 } = req.query;

    const result = await adminUserModel.getAllMembers({
      search: String(search),
      status: String(status),
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(50, Math.max(1, Number(limit) || 15)),
    });

    const users = result.users.map(u => ({
      id: u.id,
      fullName: u.full_name,
      username: u.username,
      email: u.email,
      profileImageUrl: u.profile_image_url,
      isBanned: u.is_banned,
      bannedReason: u.banned_reason,
      bannedUntil: u.banned_until,
      createdAt: u.created_at,
      lastLoginAt: u.last_login_at,
      roleName: u.role_name,
      totalReviews: u.total_reviews,
      avgRating: Number(u.avg_rating),
    }));

    return res.status(200).json({
      message: 'Daftar pengguna berhasil diambil.',
      data: {
        users,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({
      message: 'Gagal mengambil daftar pengguna.',
    });
  }
}

async function banUser(req, res) {
  try {
    const userId = req.params.id;
    const { reason, bannedUntil } = req.body;

    // Verify the user is a member (not admin)
    const member = await adminUserModel.findMemberById(userId);
    if (!member) {
      return res.status(404).json({
        message: 'Pengguna tidak ditemukan atau bukan member.',
      });
    }

    if (member.is_banned) {
      return res.status(400).json({
        message: 'Pengguna ini sudah dalam status banned.',
      });
    }

    const result = await adminUserModel.banUser(userId, {
      reason: reason || null,
      bannedUntil: bannedUntil || null,
    });

    return res.status(200).json({
      message: `Pengguna ${result.full_name} berhasil di-ban.`,
      data: {
        id: result.id,
        fullName: result.full_name,
        email: result.email,
        isBanned: result.is_banned,
        bannedReason: result.banned_reason,
        bannedUntil: result.banned_until,
      },
    });
  } catch (error) {
    console.error('banUser error:', error);
    return res.status(500).json({
      message: 'Gagal mem-ban pengguna.',
    });
  }
}

async function unbanUser(req, res) {
  try {
    const userId = req.params.id;

    const member = await adminUserModel.findMemberById(userId);
    if (!member) {
      return res.status(404).json({
        message: 'Pengguna tidak ditemukan atau bukan member.',
      });
    }

    if (!member.is_banned && (!member.banned_until || new Date(member.banned_until) <= new Date())) {
      return res.status(400).json({
        message: 'Pengguna ini tidak sedang dalam status banned.',
      });
    }

    const result = await adminUserModel.unbanUser(userId);

    return res.status(200).json({
      message: `Pengguna ${result.full_name} berhasil di-unban.`,
      data: {
        id: result.id,
        fullName: result.full_name,
        email: result.email,
        isBanned: result.is_banned,
      },
    });
  } catch (error) {
    console.error('unbanUser error:', error);
    return res.status(500).json({
      message: 'Gagal meng-unban pengguna.',
    });
  }
}

module.exports = {
  getUsers,
  banUser,
  unbanUser,
};
