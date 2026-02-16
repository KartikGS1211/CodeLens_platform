import { members } from "@wix/members";
import { Member } from ".";
import { useEffect, useState } from "react";

export const getCurrentMember = async (): Promise<Member | null> => {
  try {
    const member = await members.getCurrentMember({ fieldsets: ["FULL"] });
    if (!member) {
      console.log('==== No member found');
    }
    return member.member;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export function useMemberService() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentMember()
      .then(setMember)
      .finally(() => setLoading(false));
  }, []);

  return {
    member,
    loading,
    isAuthenticated: !!member,
  };
}