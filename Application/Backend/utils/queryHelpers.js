export const getQueryFilter = (request, userKey = "createdBy") => {
  const filter = { [userKey]: request.userId };
  const branchId = request.headers["x-branch-id"];
  const section = request.headers["x-section"];

  if (branchId) {
    filter.branch = branchId;
  }
  if (section) {
    filter.schoolSection = section;
  }
  return filter;
};

export const getPayload = (request, userKey = "createdBy") => {
  const payload = { ...request.body, [userKey]: request.userId };
  const branchId = request.headers["x-branch-id"];
  const section = request.headers["x-section"];

  if (branchId) {
    payload.branch = branchId;
  }
  if (section) {
    payload.schoolSection = section;
  }
  return payload;
};
