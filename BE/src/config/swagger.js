const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'MendingMana API Documentation',
    version: '1.0.0',
    description: 'Dokumentasi API untuk aplikasi perbandingan gadget MendingMana. Menyediakan endpoint autentikasi, katalog produk, ulasan pengguna, dan panel admin.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Lokal Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan token JWT Anda untuk melakukan otentikasi rute-rute privat.'
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Pendaftaran Member Baru',
        description: 'Mendaftarkan pengguna baru sebagai Member biasa.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'username', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'Lucky Pratama' },
                  email: { type: 'string', example: 'lucky@email.local' },
                  username: { type: 'string', example: 'lucky' },
                  password: { type: 'string', example: 'User12345!' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Registrasi berhasil.' },
          400: { description: 'Format input tidak valid.' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Masuk Akun (Login)',
        description: 'Melakukan login dan mendapatkan token JWT kustom.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['emailOrUsername', 'password'],
                properties: {
                  emailOrUsername: { type: 'string', example: 'lucky' },
                  password: { type: 'string', example: 'User12345!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login berhasil, token JWT dikembalikan.' },
          401: { description: 'Kredensial salah.' }
        }
      }
    },
    '/api/auth/google-login': {
      post: {
        tags: ['Authentication'],
        summary: 'Google OAuth Login',
        description: 'Menangani registrasi atau login otomatis pasca otentikasi Google Supabase.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'username'],
                properties: {
                  fullName: { type: 'string', example: 'Lucky Google' },
                  email: { type: 'string', example: 'lucky.google@gmail.com' },
                  username: { type: 'string', example: 'luckygoogle' },
                  profileImageUrl: { type: 'string', example: 'https://lh3.googleusercontent.com/...' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Proses login Google berhasil.' }
        }
      }
    },
    '/api/gadgets/categories': {
      get: {
        tags: ['Gadgets'],
        summary: 'Daftar Kategori',
        description: 'Mengambil seluruh kategori gadget. Hasil di-cache 1 jam.',
        responses: {
          200: { description: 'Daftar kategori dikembalikan.' }
        }
      }
    },
    '/api/gadgets/brands': {
      get: {
        tags: ['Gadgets'],
        summary: 'Daftar Brand',
        description: 'Mengambil seluruh brand gadget. Hasil di-cache 1 jam.',
        responses: {
          200: { description: 'Daftar brand dikembalikan.' }
        }
      }
    },
    '/api/gadgets': {
      get: {
        tags: ['Gadgets'],
        summary: 'Katalog Gadget',
        description: 'Mengambil katalog gadget dengan pencarian dan pagination. Hasil di-cache 5 menit.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Katalog gadget dikembalikan.' }
        }
      },
      post: {
        tags: ['Gadgets'],
        summary: 'Tambah Gadget Baru (Admin)',
        security: [{ bearerAuth: [] }],
        description: 'Membuat produk gadget baru. Memerlukan Multipart/form-data untuk unggah file gambar.',
        responses: {
          201: { description: 'Gadget berhasil ditambahkan.' }
        }
      }
    },
    '/api/gadgets/{id}': {
      get: {
        tags: ['Gadgets'],
        summary: 'Detail Gadget',
        description: 'Mengambil spesifikasi detail satu gadget berdasarkan ID. Hasil di-cache 5 menit.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Detail gadget dikembalikan.' }
        }
      },
      put: {
        tags: ['Gadgets'],
        summary: 'Update Gadget (Admin)',
        security: [{ bearerAuth: [] }],
        description: 'Mengubah data gadget berdasarkan ID.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Gadget berhasil diperbarui.' }
        }
      },
      delete: {
        tags: ['Gadgets'],
        summary: 'Hapus Gadget (Admin)',
        security: [{ bearerAuth: [] }],
        description: 'Menghapus data gadget permanen dari database.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Gadget berhasil dihapus.' }
        }
      }
    },
    '/api/reviews/gadget/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Daftar Ulasan Gadget',
        description: 'Melihat seluruh ulasan member untuk suatu produk gadget.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Daftar ulasan dikembalikan.' }
        }
      },
      post: {
        tags: ['Reviews'],
        summary: 'Tulis Ulasan Baru',
        security: [{ bearerAuth: [] }],
        description: 'Menulis ulasan ulasan untuk suatu gadget.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating', 'title', 'reviewText'],
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  title: { type: 'string', example: 'Layar AMOLED-nya indah!' },
                  reviewText: { type: 'string', example: 'Ponsel yang sangat mantap untuk menonton multimedia.' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Ulasan berhasil dibuat.' }
        }
      }
    },
    '/api/reviews/{reviewId}': {
      put: {
        tags: ['Reviews'],
        summary: 'Edit Ulasan Sendiri',
        security: [{ bearerAuth: [] }],
        description: 'Mengubah isi atau rating ulasan yang pernah diposting.',
        parameters: [
          { name: 'reviewId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                  title: { type: 'string', example: 'Setelah update baterai sedikit boros' },
                  reviewText: { type: 'string', example: 'Performa OS tetap stabil, tapi konsumsi daya baterai bertambah.' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Ulasan berhasil diperbarui.' }
        }
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Hapus Ulasan',
        security: [{ bearerAuth: [] }],
        description: 'Menghapus ulasan secara permanen (bisa dilakukan oleh penulis sendiri atau admin).',
        parameters: [
          { name: 'reviewId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Ulasan berhasil dihapus.' }
        }
      }
    },
    '/api/reviews/{reviewId}/vote': {
      post: {
        tags: ['Reviews'],
        summary: 'Vote Ulasan',
        security: [{ bearerAuth: [] }],
        description: 'Memberikan upvote, downvote, atau membatalkan vote pada ulasan pengguna lain.',
        parameters: [
          { name: 'reviewId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['voteType'],
                properties: {
                  voteType: { type: 'string', enum: ['upvote', 'downvote', 'unvote'], example: 'upvote' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Vote berhasil disimpan.' }
        }
      }
    },
    '/api/admin/dashboard': {
      get: {
        tags: ['Admin Panel'],
        summary: 'Statistik Ringkasan Dasbor',
        security: [{ bearerAuth: [] }],
        description: 'Mengambil total data statistik platform untuk admin. Hasil di-cache 5 menit.',
        responses: {
          200: { description: 'Data statistik dashboard dikembalikan.' }
        }
      }
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin Panel'],
        summary: 'Daftar Pengguna (Admin)',
        security: [{ bearerAuth: [] }],
        description: 'Mengambil daftar pengguna terdaftar lengkap dengan status blokir.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 15 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'active', 'banned'], default: 'all' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Daftar pengguna dikembalikan.' }
        }
      }
    },
    '/api/admin/users/{id}/ban': {
      patch: {
        tags: ['Admin Panel'],
        summary: 'Ban Akun Pengguna',
        security: [{ bearerAuth: [] }],
        description: 'Membekukan akun pengguna dengan alasan tertentu.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Berkali-kali menulis spam review.' },
                  bannedUntil: { type: 'string', format: 'date-time', example: '2026-06-30T00:00:00Z' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Pengguna berhasil di-ban.' }
        }
      }
    },
    '/api/admin/users/{id}/unban': {
      patch: {
        tags: ['Admin Panel'],
        summary: 'Unban Akun Pengguna',
        security: [{ bearerAuth: [] }],
        description: 'Mengaktifkan kembali akun pengguna yang sebelumnya dibekukan.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Akun pengguna diaktifkan kembali.' }
        }
      }
    },
    '/api/admin/reviews/reports': {
      get: {
        tags: ['Admin Panel'],
        summary: 'Daftar Laporan Ulasan',
        security: [{ bearerAuth: [] }],
        description: 'Mengambil daftar ulasan-ulasan yang dilaporkan oleh member.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'resolved', 'rejected', 'all'], default: 'pending' } }
        ],
        responses: {
          200: { description: 'Daftar laporan ulasan dikembalikan.' }
        }
      }
    },
    '/api/admin/reviews/reports/{id}': {
      patch: {
        tags: ['Admin Panel'],
        summary: 'Tindak Lanjuti Laporan',
        security: [{ bearerAuth: [] }],
        description: 'Admin memutuskan apakah akan menghapus ulasan yang dilaporkan atau mengabaikan laporan.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['resolved', 'rejected'], example: 'resolved' },
                  note: { type: 'string', example: 'Kata-kata kasar telah dihapus.' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Tindakan laporan ulasan berhasil disimpan.' }
        }
      }
    }
  }
};

module.exports = swaggerDocument;
