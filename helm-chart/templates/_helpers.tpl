{{/*
Expand the name of the chart.
*/}}
{{- define "enabler.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "enabler.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "enabler.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Cilium Multi-cluster global service annotations
*/}}
{{- define "globalServiceAnnotations" -}}
io.cilium/global-service: "true"
io.cilium/service-affinity: remote
{{- end }}

{{/*
Name of the component api.
*/}}
{{- define "api.name" -}}
{{- printf "%s-api" (include "enabler.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified component api name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "api.fullname" -}}
{{- printf "%s-api" (include "enabler.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}


{{/*
Component api labels
*/}}
{{- define "api.labels" -}}
helm.sh/chart: {{ include "enabler.chart" . }}
{{ include "api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Component api selector labels
*/}}
{{- define "api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "enabler.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
enabler: {{ .Chart.Name }}
app.kubernetes.io/component: api
isMainInterface: "yes"
tier: {{ .Values.api.tier }}
{{- end }}

{{/*
Return the Database Hostname
*/}}
{{- define "api.databaseHost" -}}
{{- if .Values.api.externalDatabase.enabled }}
    {{- printf "%s" .Values.api.externalDatabase.host -}}
{{- else -}}
    {{- printf "%s" (include "db.fullname" .) -}}
{{- end -}}
{{- end -}}

{{/*
Return the Database Port
*/}}
{{- define "api.databasePort" -}}
{{- if .Values.api.externalDatabase.enabled }}
    {{- printf "%d" (.Values.api.externalDatabase.port | int ) -}}
{{- else -}}
    {{- printf "%d" (.Values.db.service.ports.mongo.port  | int ) -}}
{{- end -}}
{{- end -}}

{{/*
Return the Database Username
*/}}
{{- define "api.databaseUsername" -}}
{{- if .Values.api.externalDatabase.enabled }}
    {{- printf "%s" .Values.api.externalDatabase.username -}}
{{- else -}}
    {{- printf "%s" .Values.db.envVars.username -}}
{{- end -}}
{{- end -}}

{{/*
Return the Database Password
*/}}
{{- define "api.databasePassword" -}}
{{- if .Values.api.externalDatabase.enabled }}
    {{- printf "%s" .Values.api.externalDatabase.password -}}
{{- else -}}
    {{- printf "%s" .Values.db.envVars.password -}}
{{- end -}}
{{- end -}}

{{/*
Name of the component db.
*/}}
{{- define "db.name" -}}
{{- printf "%s-db" (include "enabler.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified component db name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "db.fullname" -}}
{{- printf "%s-db" (include "enabler.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the default FQDN for db headless service.
*/}}
{{- define "db.svc.headless" -}}
{{- printf "%s-headless" (include "db.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Component db labels
*/}}
{{- define "db.labels" -}}
helm.sh/chart: {{ include "enabler.chart" . }}
{{ include "db.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Component db selector labels
*/}}
{{- define "db.selectorLabels" -}}
app.kubernetes.io/name: {{ include "enabler.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
enabler: {{ .Chart.Name }}
app.kubernetes.io/component: db
isMainInterface: "no"
tier: {{ .Values.db.tier }}
{{- end }}

{{/*
Return if it is needed to deploy MongoDB Statefulset
*/}}
{{- define "db.deploy" -}}
{{- if .Values.api.envVars.ltse }}
    {{- printf "false" }}
{{- else -}}
    {{- if .Values.api.externalDatabase.enabled }}
        {{- printf "false" }}
    {{- else -}}
        {{- printf "true" }}
    {{- end }}
{{- end }}
{{- end }}