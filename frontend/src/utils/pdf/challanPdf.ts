import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateChallanPDF = async (challan: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!challan || !challan.challanNumber || !challan.customer || !challan.items) {
        throw new Error('Invalid challan data for PDF generation');
      }

      const doc = new jsPDF();
      
      // Constants for layout
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      
      // Fonts and styling
      doc.setFont('helvetica');
      
      // Header Section
      doc.setFontSize(22);
      doc.setTextColor(30, 64, 175); // A nice professional blue
      doc.text('MINIERP CRM', margin, margin + 10);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('Sales Challan', margin, margin + 18);
      
      // Horizontal Line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, margin + 25, pageWidth - margin, margin + 25);
      
      // Challan Meta Info (Right aligned)
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      
      const metaY = margin + 35;
      const metaXLabel = pageWidth - margin - 60;
      const metaXValue = pageWidth - margin;
      
      doc.text('Challan Number:', metaXLabel, metaY);
      doc.text(challan.challanNumber, metaXValue, metaY, { align: 'right' });
      
      doc.text('Date:', metaXLabel, metaY + 6);
      doc.text(new Date(challan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), metaXValue, metaY + 6, { align: 'right' });
      
      doc.text('Status:', metaXLabel, metaY + 12);
      doc.text(challan.status, metaXValue, metaY + 12, { align: 'right' });
      
      // Customer Section (Left aligned)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER', margin, metaY - 2);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let customerY = metaY + 4;
      
      if (challan.customer.businessName) {
        doc.text(challan.customer.businessName, margin, customerY);
        customerY += 5;
      }
      
      doc.text(challan.customer.name, margin, customerY);
      customerY += 5;
      
      if (challan.customer.mobile) {
        doc.text(challan.customer.mobile, margin, customerY);
        customerY += 5;
      }
      
      if (challan.customer.email) {
        doc.text(challan.customer.email, margin, customerY);
        customerY += 5;
      }
      
      if (challan.customer.address) {
        // Handle long addresses by splitting
        const splitAddress = doc.splitTextToSize(challan.customer.address, 70);
        doc.text(splitAddress, margin, customerY);
        customerY += (splitAddress.length * 5);
      }
      
      if (challan.customer.gstNumber) {
        doc.text(`GSTIN: ${challan.customer.gstNumber}`, margin, customerY);
      }
      
      // Table Data Preparation
      const startY = Math.max(customerY, metaY + 18) + 15;
      
      const tableHead = [['Product', 'SKU', 'Qty', 'Price', 'Total']];
      const tableBody = challan.items.map((item: any) => [
        item.productName,
        item.productSku,
        item.quantity.toString(),
        `Rs. ${item.unitPrice.toFixed(2)}`,
        `Rs. ${item.lineTotal.toFixed(2)}`
      ]);
      
      // Render Table
      autoTable(doc, {
        startY: startY,
        head: tableHead,
        body: tableBody,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' }
        },
        margin: { left: margin, right: margin }
      });
      
      // Total Summary Section
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY + 10;
      
      // Horizontal line before total
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, finalY - 4, pageWidth - margin, finalY - 4);
      
      // Calculate total quantity
      const totalQty = challan.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Quantity: ${totalQty}`, margin, finalY + 2);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount: Rs. ${challan.totalAmount.toLocaleString()}`, margin, finalY + 8);
      
      if (challan.createdBy && challan.createdBy.name) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Created By: ${challan.createdBy.name}`, margin, finalY + 20);
      }
      
      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('MiniERP CRM - Sales Challan', margin, pageHeight - 12);
      
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
      }
      
      // Trigger Download
      doc.save(`Challan-${challan.challanNumber}.pdf`);
      
      resolve();
    } catch (err) {
      console.error('Error generating PDF:', err);
      reject(err);
    }
  });
};
