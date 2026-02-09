"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { RequestStatus, UserRole } from "@/lib/types";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  User,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    requests,
    users,
    handleApproveRequest,
    handleRejectRequest,
    handleMarkReady,
    handleMarkCollected,
  } = useApp();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [collectionPoint, setCollectionPoint] = useState("");
  const [assignToId, setAssignToId] = useState("");

  // Get supply chain staff for assignment
  const supplyChainStaff = users.filter(
    (u) =>
      u.role === UserRole.SUPPLY_CHAIN_LEAD || u.role === UserRole.SUPPLY_CHAIN,
  );

  const requestId = params.id as string;
  const request = requests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Request Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The request you're looking for doesn't exist.
        </p>
        <button
          onClick={() => router.push("/requests")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </button>
      </div>
    );
  }

  const statusConfig = {
    [RequestStatus.PENDING_APPROVAL]: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    [RequestStatus.APPROVED]: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
    },
    [RequestStatus.REJECTED]: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
    [RequestStatus.READY_FOR_COLLECTION]: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: PackageCheck,
    },
    [RequestStatus.COLLECTED]: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: CheckCircle2,
    },
  };

  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  // Timeline stages
  const timelineStages = [
    {
      label: "Request Submitted",
      timestamp: request.createdAt,
      actor: request.requesterName,
      icon: FileText,
      completed: true,
      description: `Requested ${request.quantity} units`,
    },
    {
      label:
        request.status === RequestStatus.REJECTED
          ? "Request Rejected"
          : "Request Approved",
      timestamp: request.approvedAt,
      actor: request.approverName,
      icon: request.status === RequestStatus.REJECTED ? XCircle : CheckCircle2,
      completed: !!request.approvedAt,
      description:
        request.status === RequestStatus.REJECTED && request.rejectionReason
          ? `Reason: ${request.rejectionReason}`
          : request.approvedAt
            ? "Approved for fulfillment"
            : "Pending approval",
      isRejected: request.status === RequestStatus.REJECTED,
    },
    {
      label: "Ready for Collection",
      timestamp: request.readyAt,
      actor: request.assignedToName,
      icon: PackageCheck,
      completed: !!request.readyAt,
      description: request.collectionPoint
        ? `Collection Point: ${request.collectionPoint}`
        : "Preparing items",
      hide: request.status === RequestStatus.REJECTED,
    },
    {
      label: "Collected",
      timestamp: request.collectedAt,
      actor: request.requesterName,
      icon: CheckCircle2,
      completed: !!request.collectedAt,
      description: request.collectedAt
        ? "Items collected successfully"
        : "Awaiting collection",
      hide: request.status === RequestStatus.REJECTED,
    },
  ];

  const handleApprove = () => {
    if (assignToId) {
      handleApproveRequest(request.id, assignToId);
      setShowApproveModal(false);
      setAssignToId("");
    }
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      handleRejectRequest(request.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason("");
    }
  };

  const handleMarkAsReady = () => {
    if (collectionPoint.trim()) {
      handleMarkReady(request.id, collectionPoint);
      setCollectionPoint("");
    }
  };

  const handleMarkAsCollected = () => {
    handleMarkCollected(request.id);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/requests")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {request.productName}
            </h1>
            <p className="text-gray-600">Request ID: {request.id}</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full border flex items-center gap-2 ${config.color}`}
          >
            <StatusIcon className="h-5 w-5" />
            <span className="font-medium">{request.status}</span>
          </div>
        </div>
      </div>

      {/* Request Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Request Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Quantity Requested</p>
              <p className="text-base font-semibold text-gray-900">
                {request.quantity} units
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Requester</p>
              <p className="text-base font-semibold text-gray-900">
                {request.requesterName}
              </p>
              <p className="text-sm text-gray-500">{request.requesterEmail}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Reason</p>
              <p className="text-base text-gray-900">{request.reason}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-base font-semibold text-gray-900">
                {format(new Date(request.createdAt), "MMM dd, yyyy")}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(request.createdAt), "h:mm a")}
              </p>
            </div>
          </div>

          {request.collectionPoint && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Collection Point</p>
                <p className="text-base font-semibold text-gray-900">
                  {request.collectionPoint}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Request Timeline
        </h2>
        <div className="relative">
          {timelineStages
            .filter((stage) => !stage.hide)
            .map((stage, index, filteredStages) => {
              const StageIcon = stage.icon;
              const isLast = index === filteredStages.length - 1;

              return (
                <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Timeline Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                        stage.completed && !stage.isRejected
                          ? "bg-purple-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                        stage.completed
                          ? stage.isRejected
                            ? "bg-red-100 border-red-600"
                            : "bg-purple-100 border-purple-600"
                          : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      <StageIcon
                        className={`h-5 w-5 ${
                          stage.completed
                            ? stage.isRejected
                              ? "text-red-600"
                              : "text-purple-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold ${
                          stage.completed ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {stage.label}
                      </h3>
                      {stage.timestamp && (
                        <span className="text-sm text-gray-500">
                          •{" "}
                          {format(new Date(stage.timestamp), "MMM dd, h:mm a")}
                        </span>
                      )}
                    </div>
                    {stage.actor && stage.completed && (
                      <p className="text-sm text-gray-600 mb-1">
                        By {stage.actor}
                      </p>
                    )}
                    <p
                      className={`text-sm ${
                        stage.isRejected ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {request.status === RequestStatus.PENDING_APPROVAL && (
          <>
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Request
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <XCircle className="h-4 w-4" />
              Reject Request
            </button>
          </>
        )}

        {request.status === RequestStatus.APPROVED && (
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={collectionPoint}
              onChange={(e) => setCollectionPoint(e.target.value)}
              placeholder="Enter collection point"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleMarkAsReady}
              disabled={!collectionPoint.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <PackageCheck className="h-4 w-4" />
              Mark as Ready
            </button>
          </div>
        )}

        {request.status === RequestStatus.READY_FOR_COLLECTION && (
          <button
            onClick={handleMarkAsCollected}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as Collected
          </button>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Request
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 min-h-[100px]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Approve Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Assign to a supply chain team member to prepare the items
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To *
              </label>
              <select
                value={assignToId}
                onChange={(e) => setAssignToId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                onClick={() => {
                  setShowApproveModal(false);
                  setAssignToId("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={!assignToId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
