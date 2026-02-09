"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  User,
  ArrowRight,
  X,
  AlertCircle,
  ChevronDown,
  Send,
  Truck,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";
import {
  RequestStatus,
  UserRole,
  type ProductRequest,
  type User as UserType,
} from "@/lib/types";

// Request Status Badge
function StatusBadge({ status }: { status: RequestStatus }) {
  const configs: Record<
    RequestStatus,
    { color: string; icon: React.ReactNode }
  > = {
    [RequestStatus.PENDING_APPROVAL]: {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <Clock size={12} />,
    },
    [RequestStatus.APPROVED]: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <CheckCircle2 size={12} />,
    },
    [RequestStatus.REJECTED]: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: <XCircle size={12} />,
    },
    [RequestStatus.READY_FOR_COLLECTION]: {
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: <Package size={12} />,
    },
    [RequestStatus.COLLECTED]: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: <CheckCircle2 size={12} />,
    },
  };

  const config = configs[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}
    >
      {config.icon}
      {status.replace(/_/g, " ")}
    </span>
  );
}

// New Request Modal
function NewRequestModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: {
    productId: string;
    quantity: number;
    reason: string;
    approverId: string;
  }) => void;
}) {
  const { products, users, currentUser } = useApp();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [approverId, setApproverId] = useState("");

  const managers = users.filter(
    (u) => u.role === UserRole.MANAGER || u.role === UserRole.ADMIN,
  );
  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productId && quantity > 0 && reason && approverId) {
      onSubmit({ productId, quantity, reason, approverId });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            New Product Request
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Requester Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Requesting As</p>
            <p className="font-semibold text-slate-800">{currentUser.name}</p>
            <p className="text-xs text-slate-500">{currentUser.role}</p>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Product *
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (SKU: {product.sku}) - Available:{" "}
                  {product.availableStock}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct?.availableStock || 100}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
            />
            {selectedProduct && selectedProduct.availableStock < quantity && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Quantity exceeds available stock
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Reason for Request *
            </label>
            <textarea
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 resize-none"
              rows={3}
              placeholder="e.g., Marketing campaign, Product testing, Customer samples..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Approver Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Request Approval From *
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              required
            >
              <option value="">Select a manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.role})
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-action-blue text-white font-semibold rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2"
              disabled={
                !productId ||
                !reason ||
                !approverId ||
                (selectedProduct && selectedProduct.availableStock < quantity)
              }
            >
              <Send size={16} /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Approval Modal
function ApprovalModal({
  request,
  onClose,
  onApprove,
  onReject,
}: {
  request: ProductRequest;
  onClose: () => void;
  onApprove: (assignedTo: string) => void;
  onReject: (reason: string) => void;
}) {
  const { users, products } = useApp();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const supplyChainStaff = users.filter(
    (u) =>
      u.role === UserRole.SUPPLY_CHAIN_LEAD || u.role === UserRole.SUPPLY_CHAIN,
  );
  const product = products.find((p) => p.id === request.productId);
  const requester = users.find((u) => u.id === request.requesterId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Review Request</h2>
          <p className="text-sm text-slate-500">{request.id}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Request Details */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Requested By</span>
              <span className="font-semibold text-slate-800">
                {requester?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Product</span>
              <span className="font-semibold text-slate-800">
                {product?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Quantity</span>
              <span className="font-semibold text-slate-800">
                {request.quantity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Reason</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px]">
                {request.reason}
              </span>
            </div>
          </div>

          {/* Action Selection */}
          {!action && (
            <div className="flex gap-3">
              <button
                onClick={() => setAction("approve")}
                className="flex-1 px-4 py-3 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-200 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                onClick={() => setAction("reject")}
                className="flex-1 px-4 py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 flex items-center justify-center gap-2"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          )}

          {/* Approve Form */}
          {action === "approve" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-700 mb-1">
                  Approving Request
                </p>
                <p className="text-xs text-green-600">
                  Assign to a supply chain team member to prepare the items
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assign To *
                </label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  <option value="">Select team member</option>
                  {supplyChainStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  onClick={() => onApprove(assignedTo)}
                  disabled={!assignedTo}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          )}

          {/* Reject Form */}
          {action === "reject" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">
                  Rejecting Request
                </p>
                <p className="text-xs text-red-600">
                  Please provide a reason for rejection
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 resize-none"
                  rows={3}
                  placeholder="Explain why this request is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  onClick={() => onReject(rejectionReason)}
                  disabled={!rejectionReason}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Close button when no action selected */}
          {!action && (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Request Row
function RequestRow({ request }: { request: ProductRequest }) {
  const router = useRouter();
  const { users, products } = useApp();
  const product = products.find((p) => p.id === request.productId);
  const requester = users.find((u) => u.id === request.requesterId);
  const assignedTo = users.find((u) => u.id === request.assignedTo);

  return (
    <tr
      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
      onClick={() => router.push(`/requests/${request.id}`)}
    >
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-900">{request.id}</p>
        <p className="text-xs text-slate-400">
          {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <User size={14} className="text-slate-500" />
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {requester?.name || "Unknown"}
            </p>
            <p className="text-xs text-slate-400">{requester?.role}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-slate-800">{product?.name}</p>
        <p className="text-xs text-slate-400">SKU: {product?.sku}</p>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="font-bold text-slate-900">{request.quantity}</span>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-600 max-w-[200px] truncate">
          {request.reason}
        </p>
      </td>
      <td className="px-4 py-4">
        {assignedTo ? (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={12} className="text-blue-600" />
            </div>
            <span className="text-xs text-slate-600">{assignedTo.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={request.status} />
      </td>
    </tr>
  );
}

export default function RequestsPage() {
  const {
    requests,
    currentUser,
    handleNewRequest,
    handleApproveRequest,
    handleRejectRequest,
    handleMarkReady,
    handleMarkCollected,
  } = useApp();

  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const canApprove =
    currentUser.role === UserRole.MANAGER ||
    currentUser.role === UserRole.ADMIN;
  const canPrepare =
    currentUser.role === UserRole.SUPPLY_CHAIN_LEAD ||
    currentUser.role === UserRole.SUPPLY_CHAIN;

  return (
    <>
      <Header title="Product Requests" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Product Requests
            </h2>
            <p className="text-sm text-slate-500">
              Manage internal product requests for marketing, samples, and
              promotions
            </p>
          </div>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-4 py-2 bg-action-blue text-white rounded-lg font-medium text-sm hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus size={16} /> New Request
          </button>
        </div>

        {/* Workflow Indicator */}
        <div className="bg-gradient-to-r from-amber-50 via-blue-50 to-green-50 rounded-xl border border-slate-200 p-4 mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">
            Request Workflow
          </p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <Clock size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Pending Approval
              </span>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Approved
              </span>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Package size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Ready for Collection
              </span>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Collected
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(RequestStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <RequestRow key={request.id} request={request} />
                ))}
              </tbody>
            </table>
          </div>
          {filteredRequests.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No requests found</p>
              <p className="text-sm">Create a new request to get started</p>
            </div>
          )}
        </div>

        {/* Quick Actions for selected request */}
        {selectedRequest &&
          selectedRequest.status !== RequestStatus.PENDING_APPROVAL && (
            <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 min-w-[300px]">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-slate-900">{selectedRequest.id}</p>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>
              <StatusBadge status={selectedRequest.status} />
              <div className="mt-4 flex gap-2">
                {selectedRequest.status === RequestStatus.APPROVED &&
                  canPrepare && (
                    <button
                      onClick={() => {
                        handleMarkReady(
                          selectedRequest.id,
                          "Main Office Reception",
                        );
                        setSelectedRequest(null);
                      }}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1"
                    >
                      <Package size={14} /> Mark Ready
                    </button>
                  )}
                {selectedRequest.status ===
                  RequestStatus.READY_FOR_COLLECTION && (
                  <button
                    onClick={() => {
                      handleMarkCollected(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Mark Collected
                  </button>
                )}
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <NewRequestModal
          onClose={() => setShowNewRequestModal(false)}
          onSubmit={(data) => {
            handleNewRequest(data);
            setShowNewRequestModal(false);
          }}
        />
      )}

      {/* Approval Modal */}
      {selectedRequest &&
        selectedRequest.status === RequestStatus.PENDING_APPROVAL &&
        canApprove && (
          <ApprovalModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onApprove={(assignedTo) => {
              handleApproveRequest(selectedRequest.id, assignedTo);
              setSelectedRequest(null);
            }}
            onReject={(reason) => {
              handleRejectRequest(selectedRequest.id, reason);
              setSelectedRequest(null);
            }}
          />
        )}
    </>
  );
}
