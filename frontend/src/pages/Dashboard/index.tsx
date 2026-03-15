import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Layout } from "../../components/layout/Layout";
import { CreateMeetingModal } from "../../components/meeting/CreateMeetingModal";
import { JoinMeetingInput } from "../../components/meeting/JoinMeetingInput";
import { meetingService } from "../../services/api/meeting.service";
import { WelcomeSection } from "./WelcomeSection";
import { DashboardActions } from "./DashboardActions";
import { RecentSessions } from "./RecentSessions";

/**
 * Dashboard page
 * Main landing page showing quick actions and meeting options
 */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] =
    useState(false);
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);

  const handleStartNewMeeting = async () => {
    setIsStartingMeeting(true);
    try {
      const newMeeting = await meetingService.createMeeting();
      navigate(`/${newMeeting.meeting_code}`);
    } catch (err) {
      console.error("Failed to create meeting:", err);
      alert("Failed to create meeting. Please try again.");
    } finally {
      setIsStartingMeeting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection userName={user?.name} />

        <DashboardActions
          onStartMeeting={handleStartNewMeeting}
          onCreateMeeting={() => setIsCreateMeetingModalOpen(true)}
          isStartingMeeting={isStartingMeeting}
        />

        {/* Join Meeting Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <JoinMeetingInput showExamples={false} />
          </div>
        </div>

        {/* Recent Sessions Section */}
        <RecentSessions />
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateMeetingModalOpen}
        onClose={() => setIsCreateMeetingModalOpen(false)}
      />
    </Layout>
  );
}
