"use strict";
import './styles.css';

export default class {
    constructor() {
        this.url = null;
        this.branch = null;
        this.refresh_in_ms = null;
        this.status_elem = null;
        this.request_headers = {};
        this.build_message = '';
    }

    monitor(parent, config) {
        if (config.branch){
            console.log('Starting CircleCI Build Monitoring')
            console.log(`Branch Name: ${config.branch}`)
            console.log(`Reload Every ${config.refresh_in_min} Minutes`)
            this.url = config.url;
            this.request_headers = config.headers;
            this.branch = config.branch;
            this.refresh_in_ms = 1000 * 60 * (config.refresh_in_min || 5);
    
            this.createDocuments(parent, config);
    
            this.loadStatus();
            setInterval(this.loadStatus, this.refresh_in_ms);    
        } else {
            console.log('CircleCI build monitor could not start. Branch not defined.')
        }
    };

    createDocuments(parent, config) {
        var dot = document.createElement('div');
        dot.classList.add('enabled');
        dot.addEventListener('click', this.handleClick.bind(this));
        dot.id = 'circleci_build_status';
        this.status_elem = parent.appendChild(dot);
    };

    loadStatus() {
        var request = new XMLHttpRequest();
        request.open('GET', this.url, true);
        Object.keys(this.request_headers).map((key) => {
            request.setRequestHeader(key, this.request_headers[key]);
        });
        request.onload = this.handleResponse.bind(this);
        request.send();
    };

    handleResponse(response) {
        let data = JSON.parse(response.currentTarget.response)
        let pendingBuilds = this.getPendingBuildsRepoNames(data, this.branch);
        let successfulBuilds = this.getLastBuildStatusByName(data, this.branch, 'success');
        let failedBuilds = this.getLastBuildStatusByName(data, this.branch, 'failed');
        let filteredFailedBuilds = failedBuilds.filter((el) => {
            return pendingBuilds.indexOf(el) < 0;
        });
        let filteredSuccessfulBuilds = successfulBuilds.filter((el) => {
            return pendingBuilds.indexOf(el) < 0;
        });
        this.status_elem.classList.remove('pending');
        this.status_elem.classList.remove('failed');
        this.status_elem.classList.remove('successful');
        if (pendingBuilds.length > 0) {
            this.status_elem.classList.add('pending');
        }
        else if (filteredFailedBuilds.length > 0) {
            this.status_elem.classList.add('failed');
        }
        else if (filteredSuccessfulBuilds.length > 0) {
            this.status_elem.classList.add('successful');
        }

        this.build_message = '';
        if (pendingBuilds.length > 0)
            this.build_message += 'Pending Builds:\n' + pendingBuilds.join(', ') + '\n\n';
        if (filteredFailedBuilds.length > 0)
            this.build_message += 'Failed Builds:\n' + filteredFailedBuilds.join(', ') + '\n\n';
        if (filteredSuccessfulBuilds.length > 0)
            this.build_message += 'Successful Builds:\n' + filteredSuccessfulBuilds.join(', ');
    };

    handleClick(event) {
        alert(this.build_message);
    }

    getPendingBuildsRepoNames(projects, branch_name) {
        let repos = [];
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].branches[branch_name] && projects[i].branches[branch_name].running_builds.length > 0) {
                repos.push(projects[i].reponame);
            }
        }
        return repos;
    };
    getLastBuildStatusByName(projects, branch_name, status) {
        let repos = [];
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].branches[branch_name] && projects[i].branches[branch_name].recent_builds.length > 0) {
                if (projects[i].branches[branch_name].recent_builds[0].outcome == status) {
                    repos.push(projects[i].reponame);
                }
            }
        }
        return repos;
    };  
}