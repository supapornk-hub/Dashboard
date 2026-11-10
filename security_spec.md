# ClassPulse Security Specification

## 1. Data Invariants
1. Only authenticated instructors can read and write course, student, session, and attendance data.
2. Instructors can strictly only access courses, students, sessions, and attendance records where `instructorId == request.auth.uid`.
3. An attendance record must reference an existing valid course and session owned by the instructor.
4. Status must strictly be one of `present`, `absent`, or `leave`.
5. Participation score must strictly be an integer between 0 and 3 inclusive.
6. User profiles in `/users/{userId}` can only be read or written by the owner (`request.auth.uid == userId`).
7. User documents cannot alter their own `role` arbitrarily to elevate privileges.

## 2. The Dirty Dozen Malicious Payloads
1. **Cross-Tenant Course Read**: User A attempts to list or read courses belonging to User B. (Expected: `PERMISSION_DENIED`)
2. **Cross-Tenant Course Write**: User A attempts to insert a course with `instructorId: "user_B"`. (Expected: `PERMISSION_DENIED`)
3. **Ghost Field Injection**: User attempts to update a course with extra undeclared fields like `isAdmin: true`. (Expected: `PERMISSION_DENIED`)
4. **Invalid Participation Score Overflow**: User attempts to submit `participationScore: 99` or `-5`. (Expected: `PERMISSION_DENIED`)
5. **Invalid Attendance Status**: User attempts to submit `status: "excused_free_pass"` outside the enum `["present", "absent", "leave"]`. (Expected: `PERMISSION_DENIED`)
6. **Student Code Spoofing**: User tries to change `studentCode` or `courseId` to an invalid junk character ID longer than 128 chars. (Expected: `PERMISSION_DENIED`)
7. **Orphaned Attendance Write**: User attempts to create an attendance record without matching `instructorId`. (Expected: `PERMISSION_DENIED`)
8. **PII Exfiltration**: Unauthenticated or unauthorized user requests `/users/{otherUserId}`. (Expected: `PERMISSION_DENIED`)
9. **Blanket List Attack**: Calling collection query on `/courses` without `where("instructorId", "==", auth.uid)`. (Expected: `PERMISSION_DENIED`)
10. **ID Poisoning Attack**: Submitting doc path variable with illegal characters or excessive bytes. (Expected: `PERMISSION_DENIED`)
11. **Negative Week Attack**: Submitting a class session with negative `weekNumber: -10`. (Expected: `PERMISSION_DENIED`)
12. **Student Roster Tampering**: User B attempts to delete students enrolled under User A's course. (Expected: `PERMISSION_DENIED`)
