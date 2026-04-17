// import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PDFLabelsPage from '../pages/adminpages/PDFLabels/PDFLabelsPage';

const PDFLabelsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PDFLabelsPage />} />
    </Routes>
  );
};

export default PDFLabelsRoutes;
