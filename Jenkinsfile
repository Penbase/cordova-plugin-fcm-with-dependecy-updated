#!groovy
/* groovylint-disable MethodReturnTypeRequired, NoDef, VariableTypeRequired */
@Library('jenkins-library@master') _
import com.penbase.rocketchat.RocketChat
import jenkins.plugins.rocketchatnotifier.*
import hudson.model.*

// à laisser en dehors de la pipeline
def FULL_BUILD = currentBuild.rawBuild.getCause(jenkins.branch.BranchEventCause) == null && currentBuild.rawBuild.getCause(org.jenkinsci.plugins.workflow.cps.replay.ReplayCause)?.getOriginal()?.getCause(jenkins.branch.BranchEventCause) == null
//currentBuild.description = FULL_BUILD ? '<span style="color: red"><b>FULL BUILD</b> (with integration tests)</span>' : 'SIMPLE BUILD (no integration tests)'

pipeline {
    agent { label 'slave-mac-sylvain' }

    environment {
        // Github variables
        GITHUB_PROJECT = 'Penbase/cordova-plugin-fcm-with-dependecy-updated'
        GITHUB_TOKEN = credentials('Github-token')
        // Build variables
        FULL_BUILD = "$FULL_BUILD"
        IS_PR = "$BRANCH_NAME".startsWith('PR-')
        PROJECT_VERSION = "$BRANCH_NAME".replaceAll('[^a-zA-Z0-9_]', '_')
        // Chemin du package.json dans lequel on modifie la version
        ROCKETCHAT_PREPROD_CHAN = 'jenkins_mobile'
        PROJECT_NAME = '@penbase/cordova-plugin-fcm-with-dependecy-updated'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    stages {
        stage('Build library and publish') {
            steps {
                script {
                    sh 'npm run build'
                    if (env.TAG_NAME) {
                        updateVersion(env.TAG_NAME)
                        sh 'npm publish'
                  } else {
                        sh 'echo No tag found. There is nothing to build and publish'
                    }
                }
            }
        }

        stage('Deploy result') {
            when {
                expression {
                    return env.TAG_NAME
                }
            }
            steps {
                script {
                    def res = ''
                    res += ':email: Mise en production de *' + PROJECT_NAME + " v${env.TAG_NAME}* terminée"
                    res += "\nDependence npm : `\"@penbase/cordova-plugin-fcm-with-dependecy-updated\" : \"${env.TAG_NAME}\"`"
                    println res

                    //Publish to rocket chat !

                    def chan = ROCKETCHAT_PREPROD_CHAN
                    if (RocketChat.sendMessage(res, chan)) {
                        println 'Message sent to rocketchat into #' + chan
                    } else {
                        println 'Unable to send message to rocketchat into #' + chan
                    }
                }
            }
        }
    }
    post {
        success {
            script {
                withCredentials([[$class: 'SSHUserPrivateKeyBinding', credentialsId: '1cc7647c-c0b0-4a9b-ae3b-9d8832a6ef7d', usernameVariable: 'USERNAME', keyFileVariable: 'IDENTITY_FILE']]) {
                    withEnv(["GIT_SSH_COMMAND=ssh -i $IDENTITY_FILE"]) {
                        sh 'echo succeeded'
                    }
                }
            }
        }
        failure {
            emailext body: '$DEFAULT_CONTENT', recipientProviders: [[$class: 'CulpritsRecipientProvider']], subject: '$DEFAULT_SUBJECT'
        }
    }
}

def updateVersion(String newVersion) {
    updateVersionJSONFile(newVersion, 'package.json')
    updateVersionJSONFile(newVersion, 'ionic/package.json')
    updateVersionJSONFile(newVersion, 'ionic/ngx/package.json')
    updateVersionJSONFile(newVersion, 'ionic/v4/package.json')
    updateVersionXMLFile(newVersion, 'plugin.xml')
}

def updateVersionJSONFile(String newVersion, String jsonFilePath) {
    sh 'echo updateVersion method'
    /* groovylint-disable-next-line VariableTypeRequired */
    def packageJson = readJSON file: jsonFilePath
    sh 'echo packageJson.version=' + jsonFilePath.version
    if (newVersion.startsWith('v')) {
        /* groovylint-disable-next-line ParameterReassignment, UnnecessarySubstring */
        newVersion = newVersion.substring(1)
        sh 'echo newVersion = ' + newVersion
    }
    packageJson.version = newVersion
    writeJSON file: jsonFilePath, json: packageJson
}

def updateVersionXMLFile(String newVersion, String xmlFilePath){
    def xml = readFile xmlFilePath
    def rootNode = new XmlParser().parseText(xml)
    print rootNode['version']
    rootNode['version'] = newVersion
    print rootNode['version']
}