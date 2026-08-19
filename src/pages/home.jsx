import React, { useState } from 'react';
import { Container, Row, Col, Card, Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/home.css';

const links = [
  { grade: 'Grade 1', url: 'https://asikasik.my.canva.site/parts-of-computer-quiz--grade-1', image: '/jellyfish.png' },
  { grade: 'Grade 2', url: 'https://wayground.com/join/', image: '/Panda.png' },
  { grade: 'Grade 3', url: 'https://www.typingclub.com/', image: '/Vector-Butterfly-PNG-Image-Background.png' },
  { grade: 'Grade 4', url: 'https://www.codechef.com/ide', image: '/dinosaur-egg.png' },
  { grade: 'Grade 5', url: 'https://beinternetawesome.withgoogle.com/en_us/interland', image: '/orca-whale.png' },
  { grade: 'Grade 6', url: 'https://encrypt-online.com/decrypt', image: '/shark.png' },
];

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby65dQ-oy0-EmI78fKpiMWll1c3jrPOY8Va00oEEmlWFXxIAuCCqSw30IWVQV6KgsZD/exec";

  const extractDomain = (url) => {
    const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : 'Website';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !fullName) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatus({ msg: 'File terlalu besar! Maksimal 10MB.', type: 'danger' });
      return;
    }

    setLoading(true);
    setStatus({ msg: '', type: '' });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64String = reader.result.split(",")[1];
        
        // Perubahan Utama: mode 'no-cors' dan redirect 'follow'
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Menghindari preflight error
          cache: 'no-cache',
          redirect: 'follow', 
          headers: {
            'Content-Type': 'text/plain;charset=utf-8', 
          },
          body: JSON.stringify({
            file: base64String,
            filename: file.name,
            mimeType: file.type,
            senderName: fullName
          })
        });

        // Karena 'no-cors' tidak bisa membaca response JSON, 
        // kita langsung anggap sukses jika tidak masuk ke catch.
        setStatus({ msg: 'Berhasil! File sedang diproses ke Drive.', type: 'success' });
        setFullName('');
        setFile(null);
        
        // Tutup modal otomatis
        setTimeout(() => setShowModal(false), 2500);

      } catch (error) {
        console.error("Upload error:", error);
        setStatus({ msg: 'Gagal! Cek koneksi atau script Anda.', type: 'danger' });
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="home-container">
      <div className="overlay py-5">
        <h1 className="text-white text-center font-bold mb-5 mt-4" style={{ fontSize: '3rem', textShadow: '2px 4px 10px rgba(0,0,0,0.3)' }}>
          Welcome to ICT Class Ms. Dianocan
        </h1>
        
        <Container>
          <Row className="justify-content-center">
            {links.map((link, index) => (
              <Col xs={12} sm={6} lg={4} className="mb-5" key={index}>
                <Card className="h-100 border-0 shadow-lg grade-card-fancy" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                  <div className="image-wrapper d-flex align-items-center justify-content-center" 
                       style={{ backgroundColor: '#f0f4f8', height: '200px', padding: '20px' }}>
                    <Card.Img 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain' 
                      }} 
                      variant="top" 
                      src={`${process.env.PUBLIC_URL}/icon/${link.image}`} 
                      alt={link.grade} 
                    />
                  </div>
                  <Card.Body className="d-flex flex-column text-center bg-white p-4">
                    <Card.Title 
                      className="fw-bold mb-3 text-dark" 
                      style={{ 
                        fontSize: '2.5rem', 
                        letterSpacing: '-1px', 
                        lineHeight: '1' 
                      }}
                    >
                      {link.grade}
                    </Card.Title>
                    <Card.Text className="text-muted mb-4"> 
                      Ayo akses materi di <br/><strong>{extractDomain(link.url)}</strong>
                    </Card.Text>
                    <Button 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      variant="primary" 
                      className="mt-auto py-2 rounded-pill fw-bold shadow-sm"
                    >
                      Buka Materi
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="mt-5 pb-5">
            <Col xs={12} className="text-center">
              <Button 
                variant="success"
                className="upload-main-btn shadow-lg fw-bold rounded-pill"
                style={{ 
                  fontSize: '1.5rem',
                  padding: '20px 60px',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  setStatus({ msg: '', type: '' });
                  setShowModal(true);
                }}
              >
                🚀 UPLOAD YOUR FILE IN HERE
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* MODAL UPLOAD */}
      <Modal show={showModal} onHide={() => !loading && setShowModal(false)} centered>
        <Modal.Header closeButton={!loading} className="border-0 pt-4 px-4">
          <Modal.Title className="fw-bold text-center w-100">Upload Dokumen ICT</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {status.msg && <Alert variant={status.type} className="rounded-3">{status.msg}</Alert>}
          <Form onSubmit={handleUpload}>
            
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">NAMA LENGKAP</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Siapa namamu?" 
                style={{ borderRadius: '10px', padding: '12px' }}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
                disabled={loading}
              />
            </Form.Group>

            {/* Form Group untuk Pilih Kelas (Grade) sudah dihapus */}

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted">PILIH DOKUMEN (MAKS 10MB)</Form.Label>
              <Form.Control 
                type="file" 
                style={{ borderRadius: '10px', padding: '10px' }}
                onChange={(e) => setFile(e.target.files[0])}
                required 
                disabled={loading}
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100 py-3 rounded-pill fw-bold shadow" disabled={loading}>
              {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Mengirim...</> : 'KIRIM SEKARANG'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;