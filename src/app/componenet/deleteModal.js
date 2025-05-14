import React from 'react'

function DeleteModal({personToDelete, loading=false,setCloseDeleteModal,handleDelete}) {
  return (
   <div className="modal fade zoom show" style={{ display: "block" }}>
            <div className="modal-dialog modal-sm" role="document">
              <div className="modal-content">
                <div className="modal-header bg-primary">
                  <h5 className="modal-title text-white">
                    <span>Delete Confirmation</span>
                  </h5>
                </div>
                <div className="modal-body pt-3">
                  <h5>Do you want to delete this person?</h5>
                  {personToDelete && (
                    <p>
                      <strong>{personToDelete.first_name} {personToDelete.last_name}</strong>
                    </p>
                  )}
                  <div className="row mt-2" style={{ borderTop: "1px solid #ede8e8" }}>
                    <div className="col-md-12"></div>
                    <div className="col-md-9 text-right pt-2">
                      <ul className="list-inline mb-0">
                        <li className="list-inline-item mr-2">
                          <button
                            type="button"
                            className="btn btn-primary w-100 justify-center"
                            onClick={() => personToDelete && handleDelete(personToDelete._id)}
                            disabled={loading || !personToDelete}
                          >
                            <span>Yes</span>
                          </button>
                        </li>
                        <li className="list-inline-item">
                          <button
                            type="button"
                            className="btn btn-danger w-100 justify-center"
                            onClick={setCloseDeleteModal}
                            disabled={loading}
                          >
                            <span>No</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default DeleteModal;