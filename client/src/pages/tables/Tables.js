import React, { useState, useEffect } from "react"
import { Grid, IconButton, Tooltip } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles"
import MUIDataTable from "mui-datatables"
import {
  Person as AccountIcon,
  DeleteOutline as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon
} from "@material-ui/icons";
// components
import PageTitle from "../../components/PageTitle";
import Widget from "../../components/Widget";
import Table from "../dashboard/components/Table/Table";
import { getUsers, deleteUser, updateUser, createUser as createUserApi } from '../../api'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import InputLabel from '@material-ui/core/InputLabel'
import TextField from '@material-ui/core/TextField'
import DateFnsUtils from '@date-io/date-fns'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers'

const useStyles = makeStyles(theme => ({
  tableOverflow: {
    overflow: 'auto'
  },
  editModal: {
    width: '500px'
  }
}))

function CustomToolbar({ handleShowCreateModal }) {
  return (
    <>
      <Tooltip title={"custom icon"}>
        <IconButton onClick={handleShowCreateModal}>
          <AddIcon />
        </IconButton>
      </Tooltip>
    </>
  )
}

export default function Tables({ sendNotification }) {
  const classes = useStyles();
  const [tableData, setTableData] = useState([])
  const [pageData, setPageData] = useState({
    rowsPerPage: 5,
    page: 0,
    count: 0,
    sortOrder: {},
    searchText: ''
  })
  const [open, setOpen] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [curId, setCurId] = useState('')
  const [curUser, setCurUser] = useState({})
  const [createUser, setCreateUser] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [createModal, setCreateModal] = useState(false)

  const columns = [
    {
      label: 'No',
      name: 'No',
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex, rowIndex) => {
          return (
              <span>{(pageData.rowsPerPage * pageData.page) + parseInt(rowIndex) + 1}</span>
            )
        }
      },
    },
    {
      label: 'Name',
      name: 'name',
      options: {
        filter: true,
        sortThirdClickReset: true,
        sortDescFirst: true,
      }
    },      
    {
      label: 'Email',
      name: 'email',
      options: {
        filter: true,
        sortThirdClickReset: true,
      }
    },
    {
      label: 'Register date',
      name: 'register_date',
      options: {
        filter: false,
        sortThirdClickReset: true,
        customBodyRenderLite: (dataIndex, rowIndex) => {
          return (
            <span>{ tableData[dataIndex].register_date.substring(0, 10) }</span>
            )
        }
      }
    },
    {
      label: 'Actions',
      name: '-',
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex, rowIndex) => {
          return (
            <>
              <IconButton
                color="secondary"
                onClick={(e) => handleOpen(tableData[dataIndex]._id)}
              >
                <DeleteIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={(e) => handleEdit(tableData[dataIndex])}
              >
                <EditIcon />
              </IconButton>
            </>
        )
        }
      }
    }
  ]

  const options = {
    filter: true,
    filterType: 'dropdown',
    responsive: 'vertical',
    serverSide: true,
    count: pageData.count,
    rowsPerPage: pageData.rowsPerPage,
    selectableRowsHideCheckboxes: true,
    rowsPerPageOptions: [5, 10, 20],
    sortOrder: {},
    onTableChange: (action, tableState) => {
      switch (action) {
        case 'changePage':
          getUsersForTable({ page: tableState.page })
          break
        case 'changeRowsPerPage':
          getUsersForTable({ rowsPerPage: tableState.rowsPerPage })
          break
        case 'sort':
          getUsersForTable({ sortOrder: tableState.sortOrder })
          break
        case 'search':
          getUsersForTable({ searchText: tableState.searchText || '' })
          break
        default:
          // console.log('action not handled.')
      }
    },
    customToolbar: () => ( <CustomToolbar handleShowCreateModal={handleCreateOpen} /> )
  }



  useEffect(() => {
    getUsersForTable({})
  }, [])

  return (
    <>
      <PageTitle title="User management" />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <MUIDataTable
            title="User List"
            data={tableData}
            columns={columns}
            options={options}
          />
        </Grid>
      </Grid>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Are you sure to delete this user?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This operation could not be irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editModal} onClose={() => setEditModal(false)}>
        <DialogTitle id="max-width-dialog-title">Edit User</DialogTitle>
        <DialogContent className={classes.editModal}>
          <DialogContentText>
            You can edit a user's profile.
          </DialogContentText>
          {
            curUser._id && (
              <form className={classes.form} noValidate>
                <FormControl className={classes.formControl} fullWidth>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    value={curUser.name}
                    onChange={e => { setCurUser({ ...curUser, name: e.target.value }) }}
                    label="Name"
                    type="text"
                    fullWidth
                  />
                  <TextField
                    autoFocus
                    margin="dense"
                    id="email"
                    value={curUser.email}
                    onChange={e => { setCurUser({ ...curUser, email: e.target.value }) }}
                    label="Email Address"
                    type="email"
                    fullWidth
                  />
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      label="Material Date Picker"
                      variant="inline"
                      value={curUser.register_date}
                      format="yyyy/MM/dd hh:mm"
                      onChange={e => { setCurUser({ ...curUser, register_date: e.target.value }) }}
                    />
                  </MuiPickersUtilsProvider>
                </FormControl>
              </form>)
          }
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdate} color="primary">
            Save
          </Button>
          <Button onClick={() => setEditModal(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={createModal} onClose={() => handleCreateClose()}>
        <DialogTitle id="max-width-dialog-title">Create User</DialogTitle>
        <DialogContent className={classes.editModal}>
          <DialogContentText>
            You can create a user.
          </DialogContentText>
            <form className={classes.form} noValidate>
              <FormControl className={classes.formControl} fullWidth>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  value={createUser.name}
                  onChange={e => { setCreateUser({ ...createUser, name: e.target.value }) }}
                  label="Name"
                  type="text"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="email"
                  value={createUser.email}
                  onChange={e => { setCreateUser({ ...createUser, email: e.target.value }) }}
                  label="Email Address"
                  type="email"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="password"
                  value={createUser.password}
                  onChange={e => { setCreateUser({ ...createUser, password: e.target.value }) }}
                  label="Password"
                  type="text"
                  fullWidth
                />
              </FormControl>
            </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreate} color="primary">
            Create
          </Button>
          <Button onClick={() => handleCreateClose()} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  function getUsersForTable({ rowsPerPage = pageData.rowsPerPage, page = pageData.page, sortOrder = pageData.sortOrder, searchText = pageData.searchText }) {
    getUsers({ rowsPerPage, page, sortOrder, searchText })
      .then(res => {
        setPageData({
          rowsPerPage,
          page,
          sortOrder,
          searchText,
          count: res.data.count
        })
        setTableData(res.data.list)
      })
      .catch(err => {
        sendNotification({
            type: 'message',
            message: 'An error occured during fetching user list.',
            variant: 'contained',
            color: 'secondary',
        }, {
          type: 'error'
        })
      })
  }

  function handleOpen(user_id) {
    setCurId(user_id)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  function handleEdit(user) {
    setCurUser(user)
    setEditModal(true)
  }

  function handleCreateOpen() {
    setCreateUser({ name: '', email: '', password: '' })
    setCreateModal(true)
  }

  function handleCreateClose() {
    setCreateModal(false)
  }

  function handleDelete() {
    deleteUser(curId)
      .then(res => {
        handleClose()

        sendNotification({
            type: 'message',
            message: 'Selected user successfully deleted.',
            variant: 'contained',
            color: 'primary',
        }, {
          type: 'success'
        })

        getUsersForTable({})
      })
      .catch(err => {
        sendNotification({
            type: 'message',
            message: 'An error occured during fetching user list.',
            variant: 'contained',
            color: 'secondary',
        }, {
          type: 'error'
        })
      })
  }

  function handleUpdate() {
    updateUser(curUser)
      .then(res => {
        setEditModal(false)

        sendNotification({
            type: 'message',
            message: 'Selected user successfully updated.',
            variant: 'contained',
            color: 'primary',
        }, {
          type: 'success'
        })

        getUsersForTable({})
      })
      .catch(err => {
        sendNotification({
            type: 'message',
            message: 'An error occured during saving a user.',
            variant: 'contained',
            color: 'secondary',
        }, {
          type: 'error'
        })
      })
  }

  function handleCreate() {
    if (!createUser.name || !createUser.email || !createUser.password) {
      sendNotification({
          type: 'message',
          message: 'You must fill all informations.',
          variant: 'contained',
          color: 'secondary',
      }, {
        type: 'error'
      })

      return
    }

    createUserApi(createUser)
      .then(res => {
        handleCreateClose()

        sendNotification({
            type: 'message',
            message: 'A user successfully created.',
            variant: 'contained',
            color: 'primary',
        }, {
          type: 'success'
        })

        getUsersForTable({})
      })
      .catch(err => {
        sendNotification({
            type: 'message',
            message: 'An error occured during creating a user.',
            variant: 'contained',
            color: 'secondary',
        }, {
          type: 'error'
        })
      })
  }
}
