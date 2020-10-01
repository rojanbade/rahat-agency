import React, { useContext, useEffect, useState } from "react";
import {
  ButtonGroup,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";

import { AppContext } from "../../../contexts/AppSettingsContext";
import { AidContext } from "../../../contexts/AidContext";
import Loading from "../../global/Loading";

export default function AidDetails(props) {
  const { addToast } = useToasts();
  const { appSettings } = useContext(AppContext);
  const [inputTokens, setInputToken] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const projectId = props.aidId;

  const {
    balance,
    getAidDetails,
    loading,
    setLoading,
    resetLoading,
    addProjectBudget,
    getAidBalance,
    changeProjectStatus,
  } = useContext(AidContext);

  const loadAidDetails = () => {
    getAidDetails(projectId)
      .then((d) => {
        setProjectDetails(d);
        loadBalance();
      })
      .catch(() => {
        addToast("Internal server error.", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const handleInputChange = (e) => {
    let { value } = e.target;
    setInputToken(value);
  };

  const addProjectBalance = () => {
    const { rahat_admin } = appSettings.agency.contracts;
    setLoading();
    addProjectBudget(projectId, inputTokens, rahat_admin)
      .then(() => {
        setInputToken(null);
        resetLoading();
        addToast("Token balance added to the project.", {
          appearance: "success",
          autoDismiss: true,
        });
        loadBalance();
      })
      .catch((err) => {
        let err_msg = "Something went wrong!!";
        if (err.code === 4001) err_msg = err.message;
        resetLoading();
        addToast(err_msg, {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: `${inputTokens} token balance will be added!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        addProjectBalance();
      }
    });
  };

  const loadBalance = () => {
    const { rahat_admin } = appSettings.agency.contracts;
    getAidBalance(projectId, rahat_admin)
      .then()
      .catch(() => {});
  };

  useEffect(loadAidDetails, []);

  const handleStatusChange = async (status) => {
    let result = await Swal.fire({
      title: "Are you sure?",
      text: `Project will be marked as ${status}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });
    if (result.isConfirmed) {
      try {
        let d = await changeProjectStatus(projectId, status);
        if (d) {
          setProjectDetails(d);
          addToast(`Project marked as ${status}.`, {
            appearance: "success",
            autoDismiss: true,
          });
        }
      } catch {
        addToast("Something went wrong on server!", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };

  const { available } = balance;

  return (
    <>
      <Form onSubmit={handleTokenSubmit}>
        <FormGroup>
          <ButtonGroup>
            <Button
              color="success"
              onClick={() => handleStatusChange("active")}
              disabled={
                projectDetails && projectDetails.status === "suspended"
                  ? false
                  : true
              }
            >
              Activate
            </Button>
            <Button
              disabled={
                projectDetails && projectDetails.status !== "suspended"
                  ? false
                  : true
              }
              color="danger"
              onClick={() => handleStatusChange("suspended")}
            >
              Suspend
            </Button>
          </ButtonGroup>
        </FormGroup>
        <FormGroup>
          <Label>Project Name</Label>
          <InputGroup>
            <Input
              readOnly
              type="text"
              name="name"
              defaultValue={projectDetails ? projectDetails.name : ""}
            />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <Label>Current Balance</Label>
          <InputGroup>
            <Input
              readOnly
              type="number"
              name="token_balance"
              value={available}
            />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <Label>Status</Label>
          <InputGroup>
            <Input
              readOnly
              type="text"
              name="status"
              defaultValue={projectDetails ? projectDetails.status : ""}
            />
          </InputGroup>
        </FormGroup>

        {projectDetails && projectDetails.status === "draft" ? (
          <InputGroup>
            <Input
              type="number"
              name="assign_tokens"
              placeholder="Enter number of token balance to be added."
              value={inputTokens || ""}
              onChange={handleInputChange}
              required
            />
            <InputGroupAddon addonType="append">
              {loading ? (
                <Loading />
              ) : (
                <Button type="submit" color="primary">
                  Add Budget
                </Button>
              )}
            </InputGroupAddon>
          </InputGroup>
        ) : projectDetails && projectDetails.status === "active" ? (
          <InputGroup>
            <Input
              type="number"
              name="assign_tokens"
              placeholder="Enter number of token balance to be added."
              value={inputTokens || ""}
              onChange={handleInputChange}
              required
            />
            <InputGroupAddon addonType="append">
              {loading ? (
                <Loading />
              ) : (
                <Button type="submit" color="primary">
                  Add Budget
                </Button>
              )}
            </InputGroupAddon>
          </InputGroup>
        ) : (
          ""
        )}
      </Form>
    </>
  );
}