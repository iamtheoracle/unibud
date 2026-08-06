import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Campus identity verification types for the UNIBUD ecosystem.
 */
export const VERIFICATION_TYPES = [
  { key: "student_id", label: "Student ID", desc: "Verify your student identity" },
  { key: "student_leader", label: "Student Leader", desc: "Student government / class leadership" },
  { key: "lecturer", label: "Lecturer", desc: "Teaching staff" },
  { key: "department", label: "Department", desc: "Academic department" },
  { key: "faculty", label: "Faculty", desc: "Faculty office" },
  { key: "university", label: "University", desc: "Institution" },
  { key: "business", label: "Campus Business", desc: "Verified campus business" },
];

export const IDENTIFIER_TYPES = [
  { key: "student_id", label: "Student ID" },
  { key: "matriculation_number", label: "Matriculation Number" },
  { key: "admission_number", label: "Admission Number" },
  { key: "registration_number", label: "Registration Number" },
  { key: "student_number", label: "Student Number" },
  { key: "temporary_student_id", label: "Temporary Student ID" },
];

/**
 * useIdentity — the campus identity engine for a student.
 * Aggregates the user, their student identifiers, and their verification
 * requests, and exposes submission mutations.
 */
export function useIdentity() {
  const qc = useQueryClient();
  const userQ = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const meId = userQ.data?.id;
  const institution = userQ.data?.data?.institution_name || userQ.data?.data?.institution_id || "My Institution";

  const idsQ = useQuery({
    queryKey: ["StudentIdentifier", meId],
    queryFn: () => base44.entities.StudentIdentifier.filter({ user_id: meId }),
    enabled: !!meId,
  });
  const reqsQ = useQuery({
    queryKey: ["VerificationRequest", meId],
    queryFn: () => base44.entities.VerificationRequest.filter({ requester_id: meId }),
    enabled: !!meId,
  });

  const identifiers = idsQ.data || [];
  const allRequests = reqsQ.data || [];
  const verifiedIds = identifiers.filter((i) => i.is_verified);
  const primaryId = identifiers.find((i) => i.is_primary) || identifiers[0];
  const isVerified = verifiedIds.length > 0;
  const pendingRequests = allRequests.filter((r) => r.status === "pending");
  const approvedRequests = allRequests.filter((r) => r.status === "approved");

  const submitId = useMutation({
    mutationFn: ({ identifier_type, identifier_value, institution_name }) =>
      base44.entities.StudentIdentifier.create({
        user_id: meId,
        institution_name,
        identifier_type,
        identifier_value,
        is_verified: false,
        issued_at: new Date().toISOString(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["StudentIdentifier", meId] }),
  });

  const submitVerification = useMutation({
    mutationFn: ({ target_type, target_name, evidence_url, notes }) =>
      base44.entities.VerificationRequest.create({
        target_type,
        target_id: meId,
        target_name: target_name || userQ.data?.full_name,
        requester_id: meId,
        requester_name: userQ.data?.full_name,
        evidence_url,
        notes,
        status: "pending",
        submitted_at: new Date().toISOString(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["VerificationRequest", meId] }),
  });

  return {
    user: userQ.data,
    meId,
    institution,
    identifiers,
    primaryId,
    isVerified,
    verifiedIds,
    allRequests,
    pendingRequests,
    approvedRequests,
    submitId: submitId.mutate,
    submitVerification: submitVerification.mutate,
    loading: submitId.isPending || submitVerification.isPending,
  };
}