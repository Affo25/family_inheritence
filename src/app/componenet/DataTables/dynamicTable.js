import React from 'react';
import { useRouter } from 'next/navigation';


function DynamicTable({
  title = 'Data Table',
  columns = [],
  data = null,
  loading = false,
  showActions = false,
  person=[],
  onDelete = null,
  onEdit = null,
  onRowClick = null,
  idField = '_id',
  detailsPath = null,
  emptyMessage = 'No records found',
  customStyles = {},
}) {
  const router = useRouter();
  
  // Convert single object to array for consistent handling
  const dataArray = Array.isArray(data) ? data : (data ? [data] : []);
  const recordCount = dataArray.length;

  // Navigate to detail page if detailsPath is provided
  const handleNavigation = async (record) => {
    if (!onRowClick && !detailsPath) return;
    
    try {
      if (onRowClick) {
        onRowClick(record);
        return;
      }
      
      const id = record[idField];
      if (!id) return console.error('No ID provided for navigation');
      router.push(`${detailsPath}${id}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      router.push('/error?type=navigation_failed');
    }
  };

  // Render a cell with appropriate formatting
  const renderCell = (record, column, index) => {
    const value = record[column.key];
    const displayValue = value !== undefined && value !== null ? value : 'N/A';
    
    // Apply custom formatting if provided
    if (column.format && typeof column.format === 'function') {
      return column.format(value, record);
    }
    
    // Handle date formatting
    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }
    
    // Apply badge styling if specified
    if (column.badgeClass) {
      return (
        <span className={`badge ${column.badgeClass}`}>
          {displayValue}
        </span>
      );
    }
    
    return displayValue;
  };

  // Render a single row
  const renderRow = (record, rowIndex) => (
    <tr 
      key={record[idField] || rowIndex} 
      onClick={() => handleNavigation(record)}
      style={onRowClick || detailsPath ? { cursor: 'pointer' } : {}}
    >
      <td>{rowIndex + 1}</td>
      
      {columns.map((column, colIndex) => (
        <td key={`${rowIndex}-${colIndex}`}>
          {renderCell(record, column, colIndex)}
        </td>
      ))}
      
      {showActions && (
        <td className="text-center">
          {onEdit && (
            <button
              type="button"
              className="btn btn-primary btn-sm ml-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn btn-danger btn-sm ml-1"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
            >
              Delete
            </button>
          )}
        </td>
      )}
    </tr>
  );

  return (
    <div className="card card-bordered card-preview" style={customStyles.card}>
      <div className="card-inner-group">
        <div className="card-inner">
          <div className="card-title-group d-flex justify-content-between align-items-center">
            <div className="card-title">
              <h5 className="title">
                {title}
                <span className="badge badge-info ml-2">
                  {recordCount}
                </span>
              </h5>
            </div>
          </div>
        </div>

        <div className="card-inner p-0 table-responsive">
          <table className="table table-hover nowrap align-middle dataTable-init" style={customStyles.table}>
            <thead style={{ fontSize: "14px", fontWeight: 'bold', ...customStyles.thead }} className="tb-tnx-head">
              <tr>
                <th scope="col">#</th>
                {columns.map((column, index) => (
                  <th key={index}>{column.label}</th>
                ))}
                {showActions && <th className="text-center">Actions</th>}
              </tr>
            </thead>
            <tbody style={{ fontFamily: "Segoe UI", ...customStyles.tbody }} className="tb-tnx-body">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (showActions ? 2 : 1)} className="text-center">
                    <span className="spinner-border text-secondary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                  </td>
                </tr>
              ) : recordCount === 0 ? (
                <tr>
                  <td colSpan={columns.length + (showActions ? 2 : 1)} className="text-center">{emptyMessage}</td>
                </tr>
              ) : (
                dataArray.map((record, index) => renderRow(record, index))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DynamicTable;
