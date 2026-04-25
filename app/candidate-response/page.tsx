import CandidateResponseClient from "./CandidateResponseClient";

interface CandidateResponsePageProps {
  searchParams: {
    token?: string;
    choice?: string;
  };
}

const CandidateResponsePage = ({
  searchParams,
}: CandidateResponsePageProps) => {
  return (
    <CandidateResponseClient
      token={searchParams.token}
      initialChoice={searchParams.choice}
    />
  );
};

export default CandidateResponsePage;
