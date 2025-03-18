import React from 'react';
import {
  LayoutGrid,
  Users,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Search,
  Bell,
  Settings,
  ArrowRight,
  ChevronRight,
  PieChart,
  Calendar,
  FileText,
} from 'lucide-react';

const HRPortalHomepage = () => {
  // Sample data for feature cards
  const features = [
    {
      id: 'employee',
      title: 'Employee Request',
      icon: <Users className='h-6 w-6 text-white' />,
      count: 12,
      bgColor: '#890707',
    },
    {
      id: 'training',
      title: 'Training Request',
      icon: <GraduationCap className='h-6 w-6 text-white' />,
      count: 8,
      bgColor: '#9e1b1b',
    },
    {
      id: 'promotion',
      title: 'Promotion Request',
      icon: <TrendingUp className='h-6 w-6 text-white' />,
      count: 5,
      bgColor: '#b32d2d',
    },
    {
      id: 'manpower',
      title: 'Manpower Request',
      icon: <UserPlus className='h-6 w-6 text-white' />,
      count: 3,
      bgColor: '#c74040',
    },
  ];

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      {/* Header - Compact */}
      <header className='bg-[#890707] text-white px-6 py-3 flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <LayoutGrid className='h-5 w-5' />
          <h1 className='text-lg font-bold'>HR Admin Portal</h1>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Bell className='h-5 w-5 cursor-pointer' />
            <span className='absolute -top-1 -right-1 bg-white text-xs text-[#890707] rounded-full h-4 w-4 flex items-center justify-center font-bold'>
              5
            </span>
          </div>
          <Settings className='h-5 w-5 cursor-pointer' />
          <div className='flex items-center space-x-2'>
            <div className='h-7 w-7 rounded-full bg-white flex items-center justify-center text-[#890707] font-bold'>
              A
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner - More compact */}
      <div className='bg-gradient-to-r from-[#890707] to-[#b22222] text-white py-8 px-6'>
        <div className='mx-auto max-w-5xl'>
          <div className='flex flex-col md:flex-row md:items-center justify-between'>
            <div className='mb-4 md:mb-0 md:mr-8'>
              <h1 className='text-2xl md:text-3xl font-bold mb-2'>
                HR Administration Portal
              </h1>
              <p className='text-white text-opacity-90'>
                Centralized system for managing employee requests
              </p>
            </div>
            <div className='flex space-x-3'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search requests...'
                  className='pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-48 md:w-64 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-75'
                />
                <Search className='h-4 w-4 text-white absolute left-3 top-2.5' />
              </div>
              <button className='bg-white text-[#890707] px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90'>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className='flex-1 py-6 px-6'>
        <div className='mx-auto max-w-5xl'>
          {/* Feature Cards - More compact grid */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            {features.map(feature => (
              <div
                key={feature.id}
                className='bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer'
              >
                <div className='p-4'>
                  <div className='flex items-center mb-3'>
                    <div
                      className='h-10 w-10 rounded-lg flex items-center justify-center'
                      style={{ backgroundColor: feature.bgColor }}
                    >
                      {feature.icon}
                    </div>
                    <div className='ml-3'>
                      <div className='text-xs font-medium text-gray-500'>
                        Pending
                      </div>
                      <div className='text-xl font-bold text-gray-800'>
                        {feature.count}
                      </div>
                    </div>
                  </div>
                  <h3 className='text-sm font-semibold text-gray-800 mb-2'>
                    {feature.title}
                  </h3>
                  <div className='flex items-center text-[#890707] text-xs font-medium'>
                    Manage <ChevronRight className='ml-1 h-3 w-3' />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex space-x-0 md:space-x-4 flex-col md:flex-row mb-6'>
            {/* Quick Stats */}
            <div className='bg-white rounded-lg shadow-sm p-4 mb-4 md:mb-0 md:w-2/3'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-bold text-gray-800'>
                  System Overview
                </h2>
                <button className='text-[#890707] text-sm font-medium flex items-center'>
                  View Reports <ArrowRight className='ml-1 h-4 w-4' />
                </button>
              </div>

              <div className='grid grid-cols-3 gap-4 mb-4'>
                <div className='bg-gray-50 rounded-lg p-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-8 w-8 rounded-full bg-[#890707] bg-opacity-10 flex items-center justify-center'>
                      <PieChart className='h-4 w-4 text-[#890707]' />
                    </div>
                    <div>
                      <div className='text-xs text-gray-500'>
                        Total Requests
                      </div>
                      <div className='text-lg font-bold text-gray-800'>28</div>
                    </div>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-lg p-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-8 w-8 rounded-full bg-[#890707] bg-opacity-10 flex items-center justify-center'>
                      <Calendar className='h-4 w-4 text-[#890707]' />
                    </div>
                    <div>
                      <div className='text-xs text-gray-500'>
                        Completed Today
                      </div>
                      <div className='text-lg font-bold text-gray-800'>7</div>
                    </div>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-lg p-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-8 w-8 rounded-full bg-[#890707] bg-opacity-10 flex items-center justify-center'>
                      <FileText className='h-4 w-4 text-[#890707]' />
                    </div>
                    <div>
                      <div className='text-xs text-gray-500'>Active Depts</div>
                      <div className='text-lg font-bold text-gray-800'>5</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <h3 className='text-sm font-semibold text-gray-500 mb-3'>
                Recent Activity
              </h3>
              <div className='space-y-2'>
                <div className='flex items-start'>
                  <div className='h-2 w-2 rounded-full bg-[#890707] mt-1.5 flex-shrink-0'></div>
                  <div className='ml-3'>
                    <p className='text-sm text-gray-700'>
                      New promotion request from Marketing dept
                    </p>
                    <p className='text-xs text-gray-500'>15 minutes ago</p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <div className='h-2 w-2 rounded-full bg-[#890707] mt-1.5 flex-shrink-0'></div>
                  <div className='ml-3'>
                    <p className='text-sm text-gray-700'>
                      3 training requests waiting for review
                    </p>
                    <p className='text-xs text-gray-500'>2 hours ago</p>
                  </div>
                </div>
                <div className='flex items-start'>
                  <div className='h-2 w-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0'></div>
                  <div className='ml-3'>
                    <p className='text-sm text-gray-700'>
                      System maintenance completed
                    </p>
                    <p className='text-xs text-gray-500'>Yesterday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-lg shadow-sm p-4 md:w-1/3'>
              <h2 className='text-lg font-bold text-gray-800 mb-4'>
                Quick Actions
              </h2>
              <div className='space-y-2'>
                <button className='w-full bg-[#890707] hover:bg-[#730606] text-white rounded-lg p-3 text-sm font-medium flex justify-between items-center'>
                  <span>Process Pending Requests</span>
                  <ArrowRight className='h-4 w-4' />
                </button>
                <button className='w-full border border-[#890707] text-[#890707] hover:bg-red-50 rounded-lg p-3 text-sm font-medium flex justify-between items-center'>
                  <span>Generate Monthly Report</span>
                  <ArrowRight className='h-4 w-4' />
                </button>
                <button className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg p-3 text-sm font-medium flex justify-between items-center'>
                  <span>System Settings</span>
                  <ArrowRight className='h-4 w-4' />
                </button>
              </div>

              <div className='mt-6'>
                <h3 className='text-sm font-semibold text-gray-500 mb-3'>
                  System Status
                </h3>
                <div className='space-y-3'>
                  <div>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-xs text-gray-500'>Server Load</span>
                      <span className='text-xs font-medium text-green-600'>
                        Normal
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-1.5'>
                      <div
                        className='bg-green-500 h-1.5 rounded-full'
                        style={{ width: '15%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-xs text-gray-500'>
                        Database Usage
                      </span>
                      <span className='text-xs font-medium text-yellow-600'>
                        Moderate
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-1.5'>
                      <div
                        className='bg-yellow-500 h-1.5 rounded-full'
                        style={{ width: '45%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-xs text-gray-500'>Storage</span>
                      <span className='text-xs font-medium text-blue-600'>
                        Good
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-1.5'>
                      <div
                        className='bg-blue-500 h-1.5 rounded-full'
                        style={{ width: '30%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Requests Preview */}
          <div className='bg-white rounded-lg shadow-sm p-4'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-bold text-gray-800'>
                Recent Requests
              </h2>
              <button className='text-[#890707] text-sm font-medium flex items-center'>
                View All <ArrowRight className='ml-1 h-4 w-4' />
              </button>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                  <tr>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      ID
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Type
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Requester
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Department
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  <tr className='hover:bg-gray-50'>
                    <td className='px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900'>
                      REQ-001
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      Employee
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      John Doe
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      IT
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap'>
                      <span className='px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                        Pending
                      </span>
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-[#890707] font-medium'>
                      Review
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900'>
                      REQ-002
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      Training
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      Jane Smith
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      Finance
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap'>
                      <span className='px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800'>
                        Approved
                      </span>
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-[#890707] font-medium'>
                      View
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900'>
                      REQ-003
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      Promotion
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      Mike Johnson
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-gray-500'>
                      Marketing
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap'>
                      <span className='px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800'>
                        In Review
                      </span>
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-sm text-[#890707] font-medium'>
                      Update
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Compact */}
      <footer className='bg-gray-800 text-white py-4 px-6'>
        <div className='mx-auto max-w-5xl flex flex-col sm:flex-row justify-between items-center'>
          <div className='flex items-center space-x-2 mb-2 sm:mb-0'>
            <LayoutGrid className='h-4 w-4' />
            <span className='text-sm font-bold'>HR Admin Portal</span>
            <span className='text-gray-400 text-xs'>© 2025 Your Company</span>
          </div>
          <div className='flex space-x-4 text-xs'>
            <a href='#' className='text-gray-400 hover:text-white'>
              Help
            </a>
            <a href='#' className='text-gray-400 hover:text-white'>
              Docs
            </a>
            <a href='#' className='text-gray-400 hover:text-white'>
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HRPortalHomepage;
