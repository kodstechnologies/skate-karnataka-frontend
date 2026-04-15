import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ClubForm from "../components/ClubForm";

type ClubType = {
  districtName: string;
  clubHeadName: string;
  email: string;
  phoneNo: string;
  officials: string[];
};

const EditClub: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [clubData, setClubData] = useState<ClubType | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch club by ID (replace with API)
  useEffect(() => {
    const fetchClub = async () => {
      try {
        // 🔥 Replace this with real API
        const response = {
          districtName: "Bangalore",
          clubHeadName: "Ravi Kumar",
          email: "ravi@gmail.com",
          phoneNo: "9876543210",
          officials: ["Suresh", "Anita"],
        };

        setClubData(response);
      } catch (error) {
        console.error("Error fetching club:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!clubData) {
    return <div style={{ padding: "20px" }}>No Data Found</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <ClubForm initialData={clubData} isEdit={true} />
    </div>
  );
};

export default EditClub;