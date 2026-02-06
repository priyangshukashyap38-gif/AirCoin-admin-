

AirCoin Admin Panel

Overview

The AirCoin Admin Panel is a secure, web-based administration system designed for the manual verification of user requests within the AirCoin ecosystem. This interface provides administrators with the necessary tools to review, validate, and approve user submissions for coin distribution, ensuring system integrity through human oversight.

Key Features

· Admin Authentication: Secure login system to restrict access to authorized personnel only.
· User Management Dashboard: View a centralized list of all users who have submitted coin requests.
· Image Review Interface: Examine user-uploaded verification images directly within the panel.
· Manual Request Control: Approve or reject user submissions with a single click, triggering corresponding actions in the main system.
· Manual Verification System: Every request is reviewed by a human admin, prioritizing accuracy and preventing automated fraud.

Technology Used

· Frontend: HTML, CSS, JavaScript
· Authentication: Firebase Authentication
· Data Management: Firebase Realtime Database (for user data and request statuses)
· Media Handling: External Image Host (Image links are stored; no binary image data is kept in Firebase)

How It Works

1. Admin Login: Authorized administrators log in using secure credentials.
2. Review Process: The dashboard populates with pending user requests. Admins can view user details and the associated verification image via a secure link.
3. Decision & Action: The admin makes a judgment based on the provided evidence.
   · Approve: Grants the specified amount of AirCoin to the user's account.
   · Reject: Declines the request and updates the user's status accordingly.
4. System Sync: All decisions are logged and immediately reflected in the main application's database.

Project Structure

The project follows a straightforward separation of concerns for clarity and maintainability:

```
project-folder/
├── index.html          # Main admin login and dashboard page
├── style.css           # All styling rules for the interface
└── script.js           # All application logic, Firebase integration, and interactivity
```

Security & Privacy

· Manual Verification: The core security model relies on human review, eliminating risks associated with flawed automated AI verification.
· No Firebase Image Storage: To optimize database performance and cost, only URLs pointing to externally hosted images are stored. No actual images are saved in Firebase Realtime Database or Storage.
· Data Cleanup: External images can be purged from the hosting service after the review process is complete, respecting data privacy.

Beta Notice

This is a Beta Version of the AirCoin Admin Panel. The system is functional but may undergo significant updates, interface changes, and feature additions based on operational feedback. Administrators should report any unexpected behavior.

Future Improvements

· Search and filter functionality for the user list.
· Admin activity log for audit trails.
· Batch approval/rejection operations.
· Enhanced request detail view.

Disclaimer

This admin panel is a control interface for a specific application logic. The administrators are solely responsible for their verification decisions. The project maintainers are not liable for any consequences arising from the approval or rejection of user requests.

---

README.md — AirCoin Downloading Website

AirCoin Downloading Website

About AirCoin

AirCoin is a novel, youth-focused initiative designed to blend digital engagement with environmental consciousness. The core concept allows participants to support ecological causes through a simple, transparent activity-based system. We are building an honest platform that prioritizes clarity and user trust above all else.

Website Purpose

This website serves as the official landing and download portal for the AirCoin mobile application. Its primary goals are to:

· Clearly introduce the AirCoin concept and its purpose.
· Provide a trustworthy and straightforward path to download the official application.
· Build user confidence through transparent communication about the project's status.

Main Features

· Clear App Introduction: A concise explanation of what AirCoin is and its core values.
· Direct Download Access: A prominent, reliable download button for the latest application version (APK).
· Clean Presentation: A minimal and focused design that avoids confusion, guiding users directly to the key action: downloading the app.

Technology Used

· Frontend: HTML, CSS, JavaScript
· Hosting: Standard web hosting service.

Design Philosophy

The website is built with a simple, clean, and mobile-friendly design philosophy. We believe in reducing clutter and focusing on essential information to provide a smooth and trustworthy user experience from the very first interaction.

Beta Status

Important Notice: The AirCoin application is currently in Public Beta. This means the core features are live and functional, but users may encounter occasional imperfections. We are actively refining the experience based on real-world feedback. Your participation and patience are greatly appreciated.

How to Use

1. Visit the AirCoin website.
2. Read about the project to understand its purpose.
3. Tap the "Download App" button to get the latest version of the AirCoin application for Android.
4. Install the APK and follow the in-app instructions to begin.

Future Plans

· Integration with official app stores (Google Play).
· Expanded educational content about supported nature projects.
· User testimonial and impact showcase sections.

Legal & Responsibility Notice

AirCoin is an independent community project. The application involves a voluntary activity-based system. Users participate at their own discretion. We encourage all users to review the app's internal terms and engage responsibly. The website and project are provided "as is" for informational and download purposes.
