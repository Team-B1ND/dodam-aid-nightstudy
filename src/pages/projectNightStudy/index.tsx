import { useState } from 'react';
import {
    useGetProjectNightStudies,
    useAllowProjectNightStudy,
    useRejectProjectNightStudy,
    usePendingProjectNightStudy,
} from '../../hooks/useProjectNightStudy';
import type { ProjectNightStudyApplication } from '../../types/nightStudy';
import { NormalNightStudy, type NormalNightStudyItem } from '../normalNightStudy';
import { ProjectDetailDialog } from './components/ProjectDetailDialog/index.tsx';
import './index.css';

const getPeriodText = (period: number): NormalNightStudyItem['time'] =>
    period === 2 ? '심자2' : '심자1';

interface Props {
    searchTerm: string;
    gradeSelected: string;
    classSelected: string;
}

export const ProjectNightStudy = ({
    searchTerm,
    gradeSelected,
    classSelected,
}: Props) => {
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] =
        useState<ProjectNightStudyApplication | null>(null);

    const { data, isLoading, error, refetch } = useGetProjectNightStudies();
    const projects = data?.content ?? [];

    const { mutate: allow } = useAllowProjectNightStudy(refetch);
    const { mutate: reject } = useRejectProjectNightStudy(refetch);
    const { mutate: pending } = usePendingProjectNightStudy(refetch);

    const toggleProject = (id: string) => {
        setSelectedProjectIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const toggleStatus = (project: ProjectNightStudyApplication) => {
        if (project.status === 'ALLOWED') {
            pending(project.id);
        } else {
            allow(project.id);
        }
    };

    const handleApprove = (id: string) => {
        allow(id);
        setSelectedProject(null);
    };

    const handleReject = (id: string, reason: string) => {
        reject({ id, reason });
        setSelectedProject(null);
    };

    const getProjectUsers = (project: ProjectNightStudyApplication) => [
        project.leader,
        ...project.members,
    ];

    const filteredProjects = projects.filter(
        (project: ProjectNightStudyApplication) => {
            const matchName = project.name
                .toLowerCase()
                .includes(searchTerm.trim().toLowerCase());
            const users = getProjectUsers(project);
            const matchGrade =
                gradeSelected === '모든 학년' ||
                users.some((user) => user.student?.grade === Number(gradeSelected[0]));
            const matchClass =
                classSelected === '모든 학반' ||
                users.some((user) => user.student?.room === Number(classSelected[0]));
            return matchName && matchGrade && matchClass;
        }
    );

    const projectItems: NormalNightStudyItem[] = filteredProjects.map((project) => ({
        id: project.id,
        studentName: project.name,
        classInfo: project.room?.name ?? '장소 미정',
        time: getPeriodText(project.period),
        timeSuffix: '',
        status: project.status === 'ALLOWED' ? 'ALLOWED' : 'PENDING',
        checked: selectedProjectIds.includes(project.id),
    }));

    const getProjectById = (id: string) =>
        filteredProjects.find((project) => project.id === id);

    if (isLoading) {
        return (
            <section className="project-night-study" aria-label="프로젝트 심자 목록">
                <p className="project-night-study__empty">불러오는 중...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="project-night-study" aria-label="프로젝트 심자 목록">
                <p className="project-night-study__error">{error}</p>
            </section>
        );
    }

    return (
        <>
            <section className="project-night-study" aria-label="프로젝트 심자 목록">
                {projectItems.length === 0 ? (
                    <p className="project-night-study__empty">
                        프로젝트가 없습니다.
                    </p>
                ) : (
                    <NormalNightStudy
                        items={projectItems}
                        onToggleCheck={toggleProject}
                        onItemClick={(id) => {
                            const project = getProjectById(id);
                            if (project) setSelectedProject(project);
                        }}
                        onStatusClick={(id) => {
                            const project = getProjectById(id);
                            if (project) toggleStatus(project);
                        }}
                    />
                    )}
            </section>

            {selectedProject && (
                <ProjectDetailDialog
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onApprove={() => handleApprove(selectedProject.id)}
                    onReject={(reason: string) =>
                        handleReject(selectedProject.id, reason)
                    }
                />
            )}
        </>
    );
};

export default ProjectNightStudy;
