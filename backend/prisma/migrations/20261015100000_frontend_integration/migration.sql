-- Preserve existing TODO tasks while expanding the status set used by the frontend.
ALTER TABLE `Task`
    MODIFY `status` ENUM('TODO', 'PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'RESCHEDULED', 'UPCOMING') NOT NULL DEFAULT 'PENDING';

UPDATE `Task` SET `status` = 'PENDING' WHERE `status` = 'TODO';

ALTER TABLE `Task`
    MODIFY `status` ENUM('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'RESCHEDULED', 'UPCOMING') NOT NULL DEFAULT 'PENDING',
    MODIFY `title` VARCHAR(200) NOT NULL,
    MODIFY `description` TEXT NULL,
    ADD COLUMN `scheduledDate` VARCHAR(10) NULL,
    ADD COLUMN `scheduledTime` VARCHAR(5) NULL,
    ADD COLUMN `dependencyId` VARCHAR(191) NULL;

ALTER TABLE `User`
    ADD COLUMN `planningMode` VARCHAR(191) NOT NULL DEFAULT 'student',
    ADD COLUMN `calendarPref` VARCHAR(191) NOT NULL DEFAULT 'gregorian';

ALTER TABLE `Goal`
    ADD COLUMN `category` VARCHAR(80) NOT NULL DEFAULT 'Personal';

ALTER TABLE `Task`
    ADD CONSTRAINT `Task_dependencyId_fkey`
    FOREIGN KEY (`dependencyId`) REFERENCES `Task`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
