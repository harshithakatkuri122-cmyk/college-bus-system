import { useAuth } from "../../context/AuthContext";
import SeniorTransportDetails from "./senior/SeniorTransportDetails";

export default function JuniorDetails() {
  const { student, setStudent } = useAuth();

  return <SeniorTransportDetails student={student} setStudent={setStudent} />;
}
