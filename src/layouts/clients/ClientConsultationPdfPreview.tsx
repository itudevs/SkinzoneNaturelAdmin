// @ts-nocheck

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";

import MDButton from "components/MDButton";

function ClientConsultationPdfPreview({ pdfUrl, fileName, onClose, onDownload }) {
  return (
    <Dialog open={Boolean(pdfUrl)} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>PDF preview - {fileName}</DialogTitle>
      <DialogContent sx={{ p: 0, height: { xs: "65vh", md: "78vh" } }}>
        <iframe
          src={pdfUrl}
          title="Client consultation PDF preview"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <MDButton variant="text" color="dark" onClick={onClose}>
          Close
        </MDButton>
        <MDButton variant="gradient" color="primary" onClick={onDownload}>
          Download PDF
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

ClientConsultationPdfPreview.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  fileName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default ClientConsultationPdfPreview;
