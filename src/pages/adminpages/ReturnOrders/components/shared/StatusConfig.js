export const statusLabels = {
    pending: "Pending",
    returnsent: "Return Sent",
    sentforrepair: "Sent For Repair",
    refunded: "Refunded",
    replaced: "Replaced",
    waitingforcustomer: "Waiting for Customer",
    fileclaim: "File Claim",
    claimfiled: "Claim Filed",
    claimapproved: "Claim Approved",
    claimrejected: "Claim Rejected",
    outofwarranty: "Out of Warranty",
    waitingfordelivery: "Waiting for Delivery",
};

export const statusColors = {
    pending: "bg-yellow-500",
    returnsent: "bg-blue-500",
    sentforrepair: "bg-purple-500",
    refunded: "bg-blue-500",
    replaced: "bg-orange-500",
    waitingforcustomer: "bg-gray-500",
    fileclaim: "bg-red-500",
    claimfiled: "bg-blue-500",
    claimapproved: "bg-blue-500",
    claimrejected: "bg-red-500",
    outofwarranty: "bg-gray-500",
    waitingfordelivery: "bg-gray-500",
};

export function getStatusKeyByLabel(label) {
    return Object.keys(statusLabels).find((key) => statusLabels[key] === label);
}