import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const Profile = () => <MockModulePage {...modulePageMockData.profile} />;

export default Profile;
