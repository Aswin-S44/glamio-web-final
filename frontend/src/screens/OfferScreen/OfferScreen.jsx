import React, { useState, useEffect, useRef } from "react";
import Upload from "antd/es/upload";
import Swal from "sweetalert2";
import {
  Plus,
  Search,
  Tag,
  Trash2,
  Edit2,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Percent,
  Camera,
  Layers,
  DollarSign,
} from "lucide-react";
import "./OfferScreen.css";
import NotFound from "../../components/NotFound/NotFound";
import { BASE_URL } from "../../constants/urls";

const CATEGORY_OPTIONS = [
  { value: "Hair", label: "Hair Cut", id: 1 },
  { value: "Skin", label: "Skin Care", id: 2 },
  { value: "Nails", label: "Nail Art", id: 3 },
  { value: "Makeup", label: "Makeup", id: 4 },
];

function OfferScreen() {
  const [offers, setOffers] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 8,
  });

  const [categoryId, setCategoryId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [image, setImage] = useState(null);

  const token = localStorage.getItem("token");
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchOffers(1);
    fetchAllServices();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchOffers(1), 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm]);

  const fetchAllServices = async () => {
    try {
      const res = await fetch(`${BASE_URL}/services?limit=100`, {
        headers: { Authorization: `${token}` },
      });
      const data = await res.json();
      if (data.services) setAllServices(data.services);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOffers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });
      const res = await fetch(`${BASE_URL}/offers?${params}`, {
        headers: { Authorization: `${token}` },
      });
      const data = await res.json();
      if (data.offers) {
        setOffers(data.offers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelection = (sId) => {
    setServiceId(sId);
    const selected = allServices.find((s) => s.id === Number(sId));
    if (selected) {
      setRegularPrice(selected.rate);
      setCategoryId(selected.categoryId);
      setImage(selected.imageUrl);
    }
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    const submitData = {
      categoryId: Number(categoryId),
      serviceId: Number(serviceId),
      regularPrice: Number(regularPrice),
      offerPrice: Number(offerPrice),
      image,
    };

    setSubmitting(true);
    try {
      const url = editingOffer
        ? `${BASE_URL}/offers/${editingOffer.id}`
        : `${BASE_URL}/offers`;

      const res = await fetch(url, {
        method: editingOffer ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(submitData),
      });

      // Parse the JSON body regardless of whether the status is 200 or 400
      const data = await res.json();

      if (res.ok) {
        Swal.fire(
          "Success",
          `Offer ${editingOffer ? "updated" : "created"}!`,
          "success"
        );
        fetchOffers(pagination.currentPage);
        closeModal();
      } else {
        // Show the specific error message returned by the backend
        Swal.fire(
          "Action Denied",
          data.message || "Something went wrong",
          "error"
        );
      }
    } catch (error) {
      // Handle network errors or server crashes
      Swal.fire("Error", "Connection to server failed", "error");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Remove this special offer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1a1a1a",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${BASE_URL}/offers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `${token}` },
          });
          fetchOffers(pagination.currentPage);
          Swal.fire("Deleted!", "Offer removed.", "success");
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const openModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setCategoryId(offer.categoryId);
      setServiceId(offer.serviceId);
      setRegularPrice(offer.regularPrice);
      setOfferPrice(offer.offerPrice);
      const serviceObj = allServices.find((s) => s.id === offer.serviceId);
      setImage(serviceObj?.imageUrl || null);
    } else {
      setEditingOffer(null);
      setCategoryId("");
      setServiceId("");
      setRegularPrice("");
      setOfferPrice("");
      setImage(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingOffer(null);
  };

  const calculateDiscount = (reg, off) => {
    if (!reg || !off) return 0;
    return Math.round(((reg - off) / reg) * 100);
  };

  return (
    <div className="of-page">
      <header className="of-header">
        <div className="of-nav-brand">
          <div>
            <h1>Special Offers</h1>
            <p>Promote your services with custom deals</p>
          </div>
        </div>
        <div className="of-header-actions">
          <div className="of-search">
            <Search size={18} />
            <input
              placeholder="Search services in offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="of-add-btn" onClick={() => openModal()}>
            <Plus size={20} /> <span>New Offer</span>
          </button>
        </div>
      </header>

      <main className="of-content">
        {loading ? (
          <div className="sv-loader">
            <div className="sv-spinner"></div>
          </div>
        ) : offers.length === 0 ? (
          <NotFound title={"Offers"} />
        ) : (
          <>
            <div className="of-grid">
              {offers.map((offer) => (
                <div key={offer.id} className="of-card">
                  <div className="of-img-wrap">
                    {offer?.service?.imageUrl ? (
                      <img src={offer?.service?.imageUrl} alt="Offer" />
                    ) : (
                      <div className="of-placeholder">
                        <Tag size={40} />
                      </div>
                    )}
                    <div className="of-discount-badge">
                      <Percent size={12} />{" "}
                      {calculateDiscount(offer.regularPrice, offer.offerPrice)}%
                      OFF
                    </div>
                  </div>
                  <div className="of-body">
                    <span className="of-category-tag">
                      {offer.categoryName}
                    </span>
                    <h3>{offer.serviceName}</h3>
                    <div className="of-pricing-row">
                      <span className="of-old-price">
                        ${offer.regularPrice}
                      </span>
                      <span className="of-new-price">${offer.offerPrice}</span>
                    </div>
                  </div>
                  <div className="of-foot">
                    <div className="of-meta">
                      <Clock size={14} /> <span>Active</span>
                    </div>
                    <div className="of-actions">
                      <button onClick={() => openModal(offer)}>
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="of-del"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sv-pagination-wrapper">
              <div className="sv-pagination-modern">
                <button
                  className="sv-pag-nav"
                  disabled={pagination?.currentPage === 1}
                  onClick={() => fetchOffers(pagination.currentPage - 1)}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="sv-pag-numbers">
                  <span className="sv-pag-current">
                    {pagination?.currentPage}
                  </span>
                  <span className="sv-pag-divider">/</span>
                  <span className="sv-pag-total">{pagination?.totalPages}</span>
                </div>
                <button
                  className="sv-pag-nav"
                  disabled={pagination?.currentPage === pagination?.totalPages}
                  onClick={() => fetchOffers(pagination?.currentPage + 1)}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {modalOpen && (
        <div className="of-modal-backdrop">
          <div className="of-modal">
            <div className="of-modal-header">
              <div className="of-modal-title">
                <div className="of-icon-box">
                  {editingOffer ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2>{editingOffer ? "Edit Offer" : "New Offer"}</h2>
                  <p>Select service and set promotional price</p>
                </div>
              </div>
              <button className="of-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="of-form">
              <div className="of-form-layout">
                <div className="of-form-side">
                  <div className="of-preview-box">
                    {image ? (
                      <img src={image} alt="Service" />
                    ) : (
                      <div className="of-img-empty">
                        <Camera size={32} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="of-form-main">
                  <div className="of-input-group">
                    <label>
                      <Layers size={14} /> Select Service
                    </label>
                    <select
                      value={serviceId}
                      onChange={(e) => handleServiceSelection(e.target.value)}
                      required
                    >
                      <option value="">Choose a service...</option>
                      {allServices.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (${s.rate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="of-row">
                    <div className="of-input-group">
                      <label>
                        <DollarSign size={14} /> Regular Price
                      </label>
                      <input
                        type="number"
                        value={regularPrice}
                        readOnly
                        placeholder="0.00"
                      />
                    </div>
                    <div className="of-input-group">
                      <label>
                        <Percent size={14} /> Offer Price
                      </label>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {regularPrice && offerPrice && (
                    <div className="of-savings-info">
                      Customer saves ${regularPrice - offerPrice} (
                      {calculateDiscount(regularPrice, offerPrice)}%)
                    </div>
                  )}
                </div>
              </div>

              <div className="of-modal-footer">
                <button
                  type="button"
                  className="of-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="of-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Processing..."
                    : editingOffer
                    ? "Update Offer"
                    : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferScreen;
