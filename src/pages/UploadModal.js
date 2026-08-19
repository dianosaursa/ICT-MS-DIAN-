import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

const UploadModal = ({ show, handleClose }) => {
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });

  // Ganti URL di bawah ini dengan URL Web App terbaru hasil "New Deployment" Anda
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby65dQ-oy0-EmI78fKpiMWll1c3jrPOY8Va00oEEmlWFXxIAuCCqSw30IWVQV6KgsZD/exec";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !fullName) return;

    // Validasi Ukuran 10MB
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ msg: 'File terlalu besar. Maksimal 10MB.', type: 'danger' });
      return;
    }

    setLoading(true);
    setStatus({ msg: '', type: '' });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64String = reader.result.split(",")[1];
        const payload = {
          file: base64String,
          filename: file.name,
          mimeType: file.type,
          senderName: fullName
        };

        // MENGGUNAKAN MODE 'no-cors'
        // Karena Google Apps Script tidak mendukung Preflight CORS standar,
        // kita kirim sebagai text/plain agar browser tidak memblokir request.
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', 
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload)
        });

        /**
         * CATATAN: Dalam mode 'no-cors', kita tidak bisa membaca isi response (JSON).
         * Jika fetch tidak masuk ke blok catch, kita anggap pengiriman berhasil.
         */
        setStatus({ 
          msg: 'Selesai! File sedang diproses ke Google Drive.', 
          type: 'success' 
        });
        
        // Reset Form setelah sukses
        setFullName('');
        setFile(null);
        e.target.reset();

      } catch (error) {
        console.error("Upload error:", error);
        setStatus({ 
          msg: 'Gagal mengirim file. Periksa koneksi atau izin script.', 
          type: 'danger' 
        });
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Dokumen ke Drive</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {status.msg && (
          <Alert variant={status.type} onClose={() => setStatus({msg:'', type:''})} dismissible>
            {status.msg}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nama Lengkap Pengirim</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Masukkan nama Anda" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Pilih File (Max 10MB)</Form.Label>
            <Form.Control 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])}
              required 
            />
            <Form.Text className="text-muted">
              PDF, Gambar, atau Dokumen lainnya.
            </Form.Text>
          </Form.Group>

          <Button 
            variant={status.type === 'success' ? "success" : "primary"} 
            type="submit" 
            className="w-100" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                {" "}Mengunggah...
              </>
            ) : 'Kirim Sekarang'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UploadModal;